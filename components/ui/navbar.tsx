"use client";

export default function Navbar() {
  return (
    <div className="fixed top-0 w-full flex justify-between items-center px-8 py-4 text-white z-20 bg-black/50 backdrop-blur-md">

      <h1 className="text-xl font-bold tracking-wide">
        MyProject
      </h1>

      <div className="flex gap-6 text-sm">
        <a href="/" className="hover:text-orange-400 transition">Home</a>
        <a href="/hero" className="hover:text-orange-400 transition">Hero</a>
        <a href="#" className="hover:text-orange-400 transition">About</a>
      </div>

    </div>
  );
}