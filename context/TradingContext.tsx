"use client"
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react"
import { EmitBetData } from "@/actions/socketHandler"
import { useDerivAccountData } from "@/hooks/useDerivUserAccount"

interface Trade {
  buy_price: number
  status: string
  profit: number
  contract_id: string
}

interface TradingContextType {
  account: any
  betOnePlaced: boolean
  betOneStatus: string
  stakeForbetOne: any
  AutoTradeBetOne: boolean
  trades: Trade[]
  CashOutBetOne: boolean
  WonAmount: number
  RoundStarted: boolean
  RoundID: number | undefined
  takeProfitForBetOne: number
  CashoutX: any
  ErrorMessage: string
  setStakeForbetOne: (value: any) => void
  setRoundID: (value: number | undefined) => void
  setRoundStarted: (value: boolean) => void
  setWonAmount: (value: number) => void
  setAutoTradeBetOne: (value: boolean) => void
  setTakeProfitForBetOne: (value: number) => void
  setRunningTrades: (value: number) => void
  setCashOutBetOne: (value: boolean) => void
  setbetOnePlaced: (value: boolean) => void
  setbetOneStatus: (value: string) => void
  setStrategy: (value: string) => void
  setSymbol: (value: string) => void
  setResetDemoBal: (value: boolean) => void
}

const TradingContext = createContext<TradingContextType | undefined>(undefined)

interface TradingProviderProps {
  children: ReactNode
  messages: any
  socket: WebSocket
  wssocket: any
  appId: any
  username: any
}

export const TradingProvider = ({ children, messages, socket, wssocket, appId, username }: TradingProviderProps) => {
  const [account, setAccount] = useState<any>()
  const [RoundStarted, setRoundStarted] = useState(false)
  const [CashOutBetOne, setCashOutBetOne] = useState(false)
  const [betOnePlaced, setbetOnePlaced] = useState(false)
  const [betOneStatus, setbetOneStatus] = useState<string>('')
  const [currency, setCurrency] = useState<string>('')
  const [AutoTradeBetOne, setAutoTradeBetOne] = useState(false)
  const [runningTrades, setRunningTrades] = useState<number>(0)
  const [stakeForbetOne, setStakeForbetOne] = useState<any>(10)
  const [WonAmount, setWonAmount] = useState<number>(0)
  const [ContractId, setContractId] = useState<number>()
  const [trades, setTrades] = useState<Trade[]>([])
  const [takeProfitForBetOne, setTakeProfitForBetOne] = useState<number>(1.10)
  const [strategy, setStrategy] = useState<string>("first")
  const [symbol, setSymbol] = useState<string>("R_100")
  const [resetDemoBal, setResetDemoBal] = useState<boolean>()
  const [RoundID, setRoundID] = useState<number>()
  const [CashoutX, setCashoutX] = useState<any>()
  const [ErrorMessage, setErrorMessage] = useState<string>("")
  const [previousStatus, setPreviousStatus] = useState<any>(null)

  const { setDerivAccountData } = useDerivAccountData()

  // Refs for state synchronization
  const RoundStartedRef = useRef(RoundStarted)
  const CashOutBetOneRef = useRef(CashOutBetOne)
  const betOnePlacedRef = useRef(betOnePlaced)
  const betOneStatusRef = useRef(betOneStatus)
  const AutoTradeBetOneRef = useRef(AutoTradeBetOne)
  const runningTradesRef = useRef(runningTrades)
  const stakeForbetOneRef = useRef(stakeForbetOne)
  const WonAmountRef = useRef(WonAmount)
  const ContractIdRef = useRef(ContractId)
  const tradesRef = useRef(trades)
  const takeProfitForBetOneRef = useRef(takeProfitForBetOne)
  const strategyRef = useRef(strategy)
  const symbolRef = useRef(symbol)
  const resetDemoBalRef = useRef(resetDemoBal)
  const RoundIDRef = useRef(RoundID)
  const CashoutXRef = useRef(CashoutX)
  const ErrorMessageRef = useRef(ErrorMessage)
  const previousStatusRef = useRef(previousStatus)

  useEffect(() => {
    RoundStartedRef.current = RoundStarted
    CashOutBetOneRef.current = CashOutBetOne
    betOnePlacedRef.current = betOnePlaced
    betOneStatusRef.current = betOneStatus
    AutoTradeBetOneRef.current = AutoTradeBetOne
    runningTradesRef.current = runningTrades
    stakeForbetOneRef.current = stakeForbetOne
    WonAmountRef.current = WonAmount
    ContractIdRef.current = ContractId
    tradesRef.current = trades
    takeProfitForBetOneRef.current = takeProfitForBetOne
    strategyRef.current = strategy
    symbolRef.current = symbol
    resetDemoBalRef.current = resetDemoBal
    RoundIDRef.current = RoundID
    CashoutXRef.current = CashoutX
    ErrorMessageRef.current = ErrorMessage
    previousStatusRef.current = previousStatus
  }, [RoundStarted, CashOutBetOne, betOnePlaced, betOneStatus, AutoTradeBetOne, runningTrades, stakeForbetOne, WonAmount, ContractId, trades, takeProfitForBetOne, strategy, symbol, resetDemoBal, RoundID, CashoutX, ErrorMessage, previousStatus])

  useEffect(() => {
    setDerivAccountData(account)
    setCurrency(account?.currency)
  }, [account, setDerivAccountData])

  useEffect(() => {
    const sendMsg = (msg: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(msg))
      }
    }

    const trimToTwoDecimals = (number: number) => parseFloat(number.toFixed(2))

    const PlaceBet = () => {
      if (betOnePlacedRef.current && betOneStatusRef.current === "active" && runningTradesRef.current === 0) {
        if (RoundIDRef.current !== undefined && RoundIDRef.current !== null) {
          const url = localStorage.getItem("userAvatar") || "assets/images/avatar.png"
          const betdata = {
            status: "open",
            bet_amount: stakeForbetOneRef.current,
            multiplier: "",
            round_id: RoundIDRef.current,
            code: account?.loginid,
            currency: account?.currency,
            profit: 0,
            appId,
            avatar: url,
            username: username.username,
          }
          EmitBetData(wssocket, betdata)
        }
      }

      if (betOnePlacedRef.current && RoundStartedRef.current && betOneStatusRef.current === "active" && runningTradesRef.current === 0) {
        if (takeProfitForBetOneRef.current >= 0.05) {
          sendMsg({
            proposal: 1,
            amount: stakeForbetOneRef.current,
            contract_type: "ACCU",
            currency: "USD",
            basis: "stake",
            growth_rate: 0.05,
            limit_order: { take_profit: takeProfitForBetOneRef.current },
            duration_unit: "s",
            product_type: "basic",
            symbol: symbolRef.current,
          })
        } else if (takeProfitForBetOneRef.current === 0) {
          sendMsg({
            proposal: 1,
            amount: stakeForbetOneRef.current,
            contract_type: "ACCU",
            currency: "USD",
            basis: "stake",
            growth_rate: 0.05,
            duration_unit: "s",
            product_type: "basic",
            symbol: symbolRef.current,
          })
        }
        setRunningTrades(prev => prev + 1)
      }
    }

    const CashOut = () => {
      if (ContractIdRef.current && CashOutBetOneRef.current) {
        sendMsg({ sell: ContractIdRef.current, price: 0 })
        setCashOutBetOne(false)
      }
    }

    const TakeProfit = () => {
      if (ContractIdRef.current) {
        sendMsg({ proposal_open_contract: 1, contract_id: ContractIdRef.current })
      }
    }

    const resetDemoBalance = () => {
      if (resetDemoBalRef.current) {
        sendMsg({ topup_virtual: 1 })
        setResetDemoBal(false)
      }
    }

    const handleOngoingBets = (proposal: any) => {
      const status = proposal.status
      const contract_id = proposal.contract_id
      const profit = proposal.profit
      const won_amount = parseFloat(profit) + parseFloat(stakeForbetOneRef.current)
      const cashout = (won_amount / stakeForbetOneRef.current).toFixed(2)
      setCashoutX(cashout)

      if (account && RoundIDRef.current !== undefined && RoundIDRef.current !== null) {
        const url = localStorage.getItem("userAvatar") || "assets/images/avatar.png"
        const betdata = {
          status,
          bet_amount: stakeForbetOneRef.current,
          multiplier: cashout,
          round_id: RoundIDRef.current,
          code: account.loginid,
          currency: account.currency,
          profit,
          appId,
          avatar: url,
          username: username.username,
        }

        if (status === "open") {
          setCashOutBetOne(false)
          setbetOnePlaced(true)
          setContractId(contract_id)
          setbetOneStatus("active")
          setRunningTrades(1)
          setWonAmount(0)
        } else if (status === "won" && previousStatusRef.current !== "won") {
          setRunningTrades(0)
          setbetOnePlaced(false)
          setbetOneStatus("")
          setContractId(0)
          setWonAmount(won_amount)
          EmitBetData(wssocket, betdata)
          setCashOutBetOne(true)
        } else if (status === "lost" && previousStatusRef.current !== "lost") {
          setRunningTrades(0)
          setbetOnePlaced(false)
          setbetOneStatus("")
          setContractId(0)
          setWonAmount(0)
          EmitBetData(wssocket, betdata)
          setCashOutBetOne(true)
        }
        setPreviousStatus(status)
      }
    }

    switch (messages?.msg_type) {
      case "authorize":
        const { balance, currency, loginid, is_virtual, account_list } = messages.authorize
        setAccount({ balance, currency, loginid, is_virtual, account_list })
        sendMsg({ ticks: symbolRef.current, subscribe: 1 })
        sendMsg({ balance: 1, subscribe: 1 })
        sendMsg({ portfolio: 1, subscribe: 1 })
        break
      case "proposal":
        const resp = messages.proposal
        if (resp) {
          sendMsg({ buy: resp.id, price: resp.ask_price })
        } else {
        //   handleFailedBets()
        }
        break
      case "buy":
        const buy_resp = messages.buy
        if (buy_resp) {
          setAccount((prev: any) => ({ ...prev, balance: buy_resp.balance_after }))
          setContractId(buy_resp.contract_id)
        } else {
        //   handleFailedBets()
        }
        break
      case "proposal_open_contract":
        const proposal = messages.proposal_open_contract
        if (proposal) handleOngoingBets(proposal)
        break
      case "error":
        // handleFailedBets()
        break
    }

    PlaceBet()
    CashOut()
    TakeProfit()
    resetDemoBalance()
  }, [messages, strategy, symbol, socket, wssocket, appId, username, account])

  const value = {
    account,
    betOnePlaced: betOnePlacedRef.current,
    betOneStatus: betOneStatusRef.current,
    stakeForbetOne: stakeForbetOneRef.current,
    AutoTradeBetOne: AutoTradeBetOneRef.current,
    trades: tradesRef.current,
    CashOutBetOne: CashOutBetOneRef.current,
    WonAmount: WonAmountRef.current,
    RoundStarted: RoundStartedRef.current,
    RoundID: RoundIDRef.current,
    takeProfitForBetOne: takeProfitForBetOneRef.current,
    CashoutX: CashoutXRef.current,
    ErrorMessage: ErrorMessageRef.current,
    setStakeForbetOne,
    setRoundID,
    setRoundStarted,
    setWonAmount,
    setAutoTradeBetOne,
    setTakeProfitForBetOne,
    setRunningTrades,
    setCashOutBetOne,
    setbetOnePlaced,
    setbetOneStatus,
    setStrategy,
    setSymbol,
    setResetDemoBal,
  }

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>
}

export const useTrading = () => {
  const context = useContext(TradingContext)
  if (!context) throw new Error("useTrading must be used within a TradingProvider")
  return context
}