"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    startTransition,
    ReactNode,
} from "react";

import { GetCookie, SetCookie } from "@/lib/Functions";
import { useDerivAccount, AccountsT } from "@/hooks/useDerivAccount";
import { useAviatorAccount, AviatorAccountsT } from "@/hooks/useAviatorAccount";
import useStoredAccounts from "@/hooks/useStoredAccounts";
import useAvatar from "@/hooks/useAvatars";
import useWebSocket from "@/hooks/useWebSocket";
import { useDerivWebsocket } from "@/hooks/useDerivWebSocket";
import { useMessages } from "@/hooks/useMessages";
import { cache } from "react";
import ErrorLoader from "@/components/ErrorLoader";

type SessionContextType = {
    account: any;
    loading: boolean;
    error: string | null;
    connected: boolean;
    username: string;
    avatar: string | null;
    activeAccount: AccountsT | null;
    multiplier: any;
    multipliers: any[];
    AllbetsData: any[];
    LiveBetsData: any[];
    UpdatedBetData: any[];
    maxMultiplier: any;
    crashed: string;
    socket: any;
    wssocket: any;
    handleAvatarUpdate: (avatar: string) => void;
    handleToggleChat: () => void;
    handleActiveAccount: (account: AccountsT) => void;
    isChatVisible: boolean;
    connectionComplete: boolean;
    cookieExists: number;
    messages: any;
    appId: any;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectionComplete, setConnectionComplete] = useState(false);
    const [authToken, setAuthToken] = useState('');
    const [cookieExists, setCookieExists] = useState(1);

    const [isChatVisible, setIsChatVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [multipliers, setMultipliers] = useState([]);
    const [multiplier, setMultiplier] = useState();
    const [AllbetsData, setAllbetsData] = useState([]);
    const [LiveBetsData, setLiveBetsData] = useState([]);
    const [UpdatedBetData, setUpdatedBetData] = useState([]);
    const [maxMultiplier, setMaxMultiplier] = useState(0);
    const [crashed, setCrashed] = useState("");

    const DerivAccounts = useDerivAccount();
    const AviatorAccount = useAviatorAccount();
    const [derivaccounts, setDerivAccounts] = useState<AccountsT[]>(DerivAccounts);
    const [aviatoraccount, setAviatorAccount] = useState<AviatorAccountsT>(AviatorAccount);
    const { activeAccount, toggleActiveAccount, setActiveAccount } = useStoredAccounts();
    const { avatar, updateAvatar } = useAvatar();
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(avatar);

    const authTokenRef = useRef(authToken);
    const connectionCompleteRef = useRef(connectionComplete);
    const cookieExistsRef = useRef(cookieExists);
    const multipliersRef = useRef(multipliers);
    const multiplierRef = useRef(multiplier);
    const AllbetsDataRef = useRef(AllbetsData);
    const LiveBetsDataRef = useRef(LiveBetsData);
    const UpdatedBetDataRef = useRef(UpdatedBetData);

    const { wssocket }: any = useWebSocket({
        onMessage: ({ eventName, data }) => {
            switch (eventName) {
                case "username":
                    setUsername(data);
                    break;
                case "multiplier_data":
                    setMultipliers(data);
                    multipliersRef.current = data;
                    break;
                case "bets_data":
                    setAllbetsData(data);
                    AllbetsDataRef.current = data;
                    break;
                case "live-bets":
                    setLiveBetsData(data);
                    LiveBetsDataRef.current = data;
                    break;
                case "bet-updated":
                    setUpdatedBetData(data);
                    UpdatedBetDataRef.current = data;
                    break;
                case "multiplier":
                    setMultiplier(data.multiplier);
                    multiplierRef.current = data;
                    break;
                case "maxMultiplier":
                    setMaxMultiplier(data.value);
                    multiplierRef.current = data;
                    break;
                case "crashed":
                    setCrashed(data.crashed);
                    multiplierRef.current = data;
                    break;
            }
        },
        onConnect: () => {
            setConnected(true);
            console.log('WebSocket connected!');
        },
        onDisconnect: () => {
            setConnected(false);
            console.log('WebSocket disconnected!');
        },
    });

    const { messages, socket } = useDerivWebsocket({
        token: activeAccount?.token,
        deriv_id: activeAccount?.derivId,
    });

    const { account } = useMessages({
        messages,
        socket,
        wssocket,
        appId: activeAccount?.derivId,
        username
    });

    useEffect(() => {
        authTokenRef.current = authToken;
        connectionCompleteRef.current = connectionComplete;
        cookieExistsRef.current = cookieExists;
    }, [authToken, connectionComplete, cookieExists]);

    useEffect(() => {
        sessionStorage.setItem("accounts", JSON.stringify(derivaccounts));
    }, [derivaccounts]);

    useEffect(() => {
        if (connectionComplete) {
            const cookie = GetCookie("token");
            cookie ? setCookieExists(2) : setCookieExists(3);
        }
    }, [connectionComplete, activeAccount, avatar]);

    const validateAndFetchToken = cache(async () => {
        try {
            setLoading(true);
            setAviatorAccount(prev => ({ ...prev, origin: window.location.origin }));

            const app_data = {
                acc: aviatoraccount,
                origin: window.location.origin,
            };

            await new Promise<void>((resolve) => {
                startTransition(() => {
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authorize`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(app_data),
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (!data.success) {
                                setError(data.message);
                                return;
                            }

                            if (derivaccounts.length === 0) {
                                setError('No Deriv Accounts found!');
                                return;
                            }

                            const updatedAccounts = [...derivaccounts];
                            const processAccount = async (account: AccountsT, index: number) => {
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/query-user`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(account),
                                });
                                const result = await response.json();

                                if (result.success) {
                                    updatedAccounts[index].authToken = result.auth_token;
                                    if (index === 0) {
                                        sessionStorage.setItem('activeAccount', JSON.stringify(updatedAccounts[0]));
                                        SetCookie(updatedAccounts[0].authToken);
                                        setActiveAccount(updatedAccounts[0]);
                                        setAuthToken(updatedAccounts[0].authToken);
                                    }
                                }
                            };

                            Promise.all(derivaccounts.map((acc, i) => processAccount(acc, i)))
                                .then(() => {
                                    setDerivAccounts(updatedAccounts);
                                    const allSuccessful = updatedAccounts.every(acc => acc.authToken);

                                    if (!allSuccessful) {
                                        setError('Some accounts failed to connect!');
                                    } else {
                                        setConnected(true);
                                        setConnectionComplete(true);
                                    }
                                })
                                .catch(error => {
                                    setError('Connection error');
                                    console.error(error);
                                });
                        })
                        .catch(error => {
                            setError('API error');
                            console.error(error);
                        })
                        .finally(() => {
                            setLoading(false);
                            resolve();
                        });
                });
            });
        } catch (error) {
            console.error('Validation error:', error);
            setError('Validation failed');
            setLoading(false);
        }
    });

    useEffect(() => {
        validateAndFetchToken();
    }, []);

    const handleAvatarUpdate = (newAvatar: string) => {
        updateAvatar(newAvatar);
        setSelectedAvatar(newAvatar);
    };

    const handleToggleChat = () => setIsChatVisible(prev => !prev);

    const handleActiveAccount = (account: AccountsT) => {
        setActiveAccount(account);
        toggleActiveAccount(account);
    };

    useEffect(() => {
        setSelectedAvatar(avatar);
    }, [avatar]);

    if (cookieExists === 3) {
        return <ErrorLoader />;
    }

    return (
        <SessionContext.Provider
            value={{
                account,
                loading,
                error,
                connected,
                username,
                avatar: selectedAvatar,
                activeAccount,
                multiplier,
                multipliers,
                AllbetsData,
                LiveBetsData,
                UpdatedBetData,
                maxMultiplier,
                crashed,
                socket,
                wssocket,
                handleAvatarUpdate,
                handleToggleChat,
                handleActiveAccount,
                isChatVisible,
                connectionComplete,
                cookieExists,
                messages,
                appId : activeAccount?.derivId,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};