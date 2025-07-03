import LuigiImg from "./assets/Luigi.jpg";

export default function App() {
  return (
    <div
      classname="w-screen h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${LuigiImg})` }}
    >
      <div className="flex items-center justify-center h-full bg-black/40 text-white text-3xl font-bold">
        Welcome to Odds On!
      </div>
    </div>
  );
}
