import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
  <div>
    <h2 className="font-semibold text-2xl">Hello world</h2>
  </div>
  );
}
