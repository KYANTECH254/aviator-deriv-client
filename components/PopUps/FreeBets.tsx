"use client"

import useStoredAccounts from "@/hooks/useStoredAccounts";
import { DeleteCookie, SetCookie } from "@/lib/Functions";
import { useEffect, useRef, useState } from "react";

export default function FreeBets({ onClose, onToggleActiveAccount }: any) {
    const popupRef = useRef<HTMLDivElement>(null);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const { activeAccount, storedAccounts, toggleActiveAccount } = useStoredAccounts()
    const activeAccountRef = useRef(activeAccount)

    useEffect(() => {
        activeAccountRef.current = activeAccount      
    }, [activeAccount])

    useEffect(() => {
        const storedAccounts = sessionStorage.getItem("accounts");
        const storedActiveAccount = sessionStorage.getItem("activeAccount");

        if (storedActiveAccount) {
            const parsedAccount = JSON.parse(storedActiveAccount);
            setSelectedAccount(parsedAccount.code)
            toggleActiveAccount(parsedAccount)
        }

        if (storedAccounts) {
            const parsedAccounts = JSON.parse(storedAccounts);
            // getStoredAccounts(parsedAccounts)
            setSelectedAccount(activeAccountRef.current?.code || (parsedAccounts.length > 0 ? parsedAccounts[0].code : null));
        } else {
            // getStoredAccounts([])
            setSelectedAccount(null);
        }

    }, [selectedAccount]);

    const handleOutsideClick = (event: any) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleAccountClick = (account: any) => {
        setSelectedAccount(account.code);
        toggleActiveAccount(account)
        onToggleActiveAccount(account)
        if (DeleteCookie("token")) {
            SetCookie(account.authToken)
        }
    };

    return (
        <div id="aviator-freebets-tab" className="aviator-popup-container">
            <div ref={popupRef} className="aviator-freebets-popup">
                <div className="aviator-popup-header">
                    <div className="aviator-popup-header-left">MY DERIV ACCOUNTS</div>
                    <div onClick={onClose} id="aviator-popup-close" className="aviator-popup-header-right">
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </div>
                </div>
                <div id="free-bets-tab" className="aviator-popup-freebets-body">
                    <div className="aviator-popup-freebets-body-container display-center">
                        <div className="aviator-popup-freebets-body-container-bottom display-center">
                            {storedAccounts.length === 0 ? (
                                <div className="no-accounts-message">
                                    No accounts available
                                </div>
                            ) : (
                                storedAccounts.map((account) => (
                                    <div
                                        key={account.code}
                                        className={`aviator-popup-accounts-box display-center ${selectedAccount === account.code ? "selected" : ""}`}
                                        onClick={() => handleAccountClick(account)}
                                    >
                                        {account.code} {account.currency}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
