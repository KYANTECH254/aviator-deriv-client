"use client"
import { myPref } from "@/lib/Setting"
import { useEffect, useState } from "react"

export const useDerivWebsocket = ({
    token,
    deriv_id,
}: {
    token: string
    deriv_id: string
}) => {
    const [messages, setMessages] = useState()
    const [socket, setSocket] = useState<any>()
    const [ws_socket_errors, setWs_SocketErrors] = useState('')

    useEffect(
        function () {
            if (token || deriv_id) {
                let ws = new WebSocket(`${myPref.wsUrl}${deriv_id}`)

                ws.onopen = function (e) {
                    ws.send(
                        JSON.stringify({
                            authorize: token,
                        })
                    )

                    ws.send(
                        JSON.stringify({
                            ping: 1,
                        })
                    )

                    setInterval(function () {
                        ws.send(
                            JSON.stringify({
                                ping: 1,
                            })
                        )
                    }, 15000)
                }

                ws.onmessage = function (event) {
                    const message = JSON.parse(event.data)
                    setMessages(message)
                }

                ws.onclose = function (event) {
                    if (event.wasClean) {
                        setWs_SocketErrors(`Connection timed out!`)

                    } else {
                        setWs_SocketErrors(`Connection timed out!`)

                    }
                }

                ws.onerror = function (error) {
                    setWs_SocketErrors(`Connection timed out!`)
                    console.log(error)
                }

                setSocket(ws)
            }
        },
        [token, deriv_id]
    )

    return {
        messages,
        socket,
        ws_socket_errors
    }
}
