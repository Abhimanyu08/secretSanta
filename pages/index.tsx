import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import bgImage from "../public/bg.jpg";
import decidingSanta from "../public/deciding-santa.gif";
import finalSanta from "../public/final-santa.gif";
import roomNameGenerator from "../utils/getRoomName";
import { roasts } from "../utils/roasts";

const Home: NextPage = () => {
	const router = useRouter();

	const { roomId } = router.query;
	const [socket, setSocket] = useState<Socket>();
	const [participants, setParticipants] = useState<string[]>([]);
	const [santa, setSanta] = useState("");
	const [name, setName] = useState("");
	const [roomLink, setRoomLink] = useState("");
	const [room, setRoom] = useState("");
	const [createdOrJoined, setCreatedOrJoined] = useState(false);
	const [allotingSanta, setAllotingSanta] = useState(false);
	const [allotAgainRequesters, setAllotAgainRequesters] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		if (socket === undefined) {
			const newSocket = io(
				"https://Secret-Santa-Server.abhimanyu08.repl.co",
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

	useEffect(() => {
		if (socket) {
			socket?.on(
				"allotRequest",
				(val: { requestee: string; comment: string }) => {
					setAllotAgainRequesters((prev) => ({
						...prev,
						[val.requestee]: val.comment,
					}));
				}
			);
			socket.on("allotingSanta", () => {
				setSanta("");
				setAllotingSanta(true);
			});
		}
		// return () => {
		// 	socket?.emit("destroyRoom");
		// };
	}, [socket]);

	useEffect(() => {
		if (roomId) setRoom(roomId as string);
	}, [roomId]);

	useEffect(() => {
		if (santa) {
			setAllotAgainRequesters({});
			setAllotingSanta(false);
		}
	}, [santa]);

	const onCreateRoom = () => {
		if (!name) {
			alert("please enter a name");
			return;
		}
		if (roomId) {
			socket?.emit("joinRoom", roomId, name);
			setCreatedOrJoined(true);
			return;
		}

		const roomName = roomNameGenerator();
		setRoom(roomName);
		socket?.emit("createRoom", roomName, name);
		const link =
			window.location.hostname === "localhost"
				? `${window.location.protocol}//${window.location.hostname}:3000?roomId=${roomName}`
				: `${window.location.protocol}//${window.location.hostname}?roomId=${roomName}`;
		setRoomLink(link);
		setCreatedOrJoined(true);
	};

	const onAllotSanta = (room: string) => {
		setSanta("");
		setAllotingSanta(true);
		socket?.emit("getSecretSanta", room);
	};

	const allotAgain = (room: string) => {
		const comment = roasts.at(Math.floor(Math.random() * roasts.length));
		socket?.emit("getSecretSantaAgain", room, comment);
	};

	return (
		<div
			className="flex flex-col min-h-screen w-screen  items-center justify-center bg-cover"
			style={{ backgroundImage: `url(${bgImage.src})` }}
		>
			{!createdOrJoined && (
				<div className="flex flex-col md:flex-row  h-fit gap-5 items-center text-lg font-semibold text-amber-400 tracking-wide">
					{roomId ? (
						<span>Enter your name to join room: </span>
					) : (
						<span>Enter your name to create room: </span>
					)}
					<input
						type="text"
						name=""
						id=""
						value={name}
						className=" bg-white rounded-md h-10 text-black p-2 font-mono w-64"
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
			)}
			{roomId === undefined && !createdOrJoined && (
				<div
					className="rounded-md p-2 text-black bg-amber-400 mt-10 font-bold cursor-pointer"
					onClick={onCreateRoom}
				>
					Create Room
				</div>
			)}
			{typeof roomId === "string" && !createdOrJoined && (
				<div
					className="rounded-md p-2 bg-amber-400 text-black mt-10 font-bold cursor-pointer"
					onClick={onCreateRoom}
				>
					Join Room
				</div>
			)}
			{participants.length > 0 && (
				<div className="flex flex-col w-full grow justify-center items-center gap-10 overflow-y-auto">
					<div className="flex flex-col items-center md:flex-row w-full gap-16  justify-center text-center  my-5 relative">
						{participants.map((val, idx) => (
							<span
								className={`${
									idx % 2 === 0
										? "tooltip-bottom lg:tooltip-top"
										: "tooltip-bottom"
								} ${
									Object.hasOwn(allotAgainRequesters, val)
										? "  tooltip tooltip-open"
										: ""
								}`}
								data-tip={allotAgainRequesters[val]}
							>
								<button className="text-2xl">🧝‍♂️</button>
								{val}
							</span>
						))}
					</div>
					<span
						className={`items-center text-xl px-4 font-semibold flex gap-2 ${
							participants.at(0) === name ? "" : "hidden"
						}`}
					>
						{santa ? (
							<span>
								Don't want to gift anything to {santa} ? Allot
								again
							</span>
						) : (
							<span>Allot Secret Santas </span>
						)}
						<div
							className={`text-3xl mt-3 cursor-pointer rounded-md ${
								santa || allotingSanta ? "" : "animate-pulse"
							} ${allotingSanta ? "animate-spin" : ""}`}
							onClick={() => onAllotSanta(room)}
						>
							🎲
						</div>
					</span>
					{roomId && santa && (
						<span className="font-semibold">
							Don't want to gift anything to {santa}?
							<button
								className="px-2 py-1 bg-amber-400 inline rounded-md m-2 font-bold cursor-pointer"
								onClick={() => allotAgain(room)}
							>
								Ask
							</button>
							room owner to allot again
						</span>
					)}
					{santa && (
						<span className="text-xl">
							You are secret santa for: 🧝‍♂️
							<span>{santa}</span>
						</span>
					)}
					{allotingSanta && (
						<Image
							src={decidingSanta.src}
							height={300}
							width={400}
							alt="deciding santa"
						/>
					)}
					{santa && (
						<Image
							src={finalSanta.src}
							height={200}
							width={300}
							alt="final santa"
						/>
					)}
				</div>
			)}
			{roomLink !== "" && (
				<div className="flex mb-10 mt-4 flex-col w-52 md:w-fit md:flex-row gap-2 md:gap-0">
					<span className="bg-gradient-to-tr rounded-r-md md:rounded-r-none from-red-500 to-amber-500 p-2 rounded-l-md">
						Room Link:{" "}
					</span>
					<span className="bg-white select-all p-2 rounded-r-md rounded-l-md md:rounded-l-none break-words">
						{roomLink}
					</span>
				</div>
			)}
		</div>
	);
};

export default Home;
