import type { AppProps } from "next/app";
import {
	createContext,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import "../styles/globals.css";

import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<{
	socket?: Socket;
	participants: string[];
	santa: string;
	setSanta: Dispatch<SetStateAction<string>>;
}>({ participants: [], santa: "", setSanta: () => "" });

function MyApp({ Component, pageProps }: AppProps) {
	const [socket, setSocket] = useState<Socket>();
	const [participants, setParticipants] = useState<string[]>([]);
	const [santa, setSanta] = useState("");

	useEffect(() => {
		if (socket === undefined) {
			const newSocket = io(
				"https://BigheartedExhaustedGravity.abhimanyu08.repl.co",
				{
					transports: ["websocket"],
				}
			);

			newSocket.on("joined", (val: { members: string[] }) => {
				console.log(val);
				setParticipants(val.members);
			});

			newSocket.on("santa", (name) => {
				setSanta(name);
			});

			setSocket(newSocket);
		}
	}, []);

	return (
		<SocketContext.Provider
			value={{ socket, participants, santa, setSanta }}
		>
			<Component {...pageProps} />
		</SocketContext.Provider>
	);
}

export default MyApp;
