"use client";
import Hero from "@/components/ui/animated-shader-hero";
import Navbar from "@/components/ui/navbar";

export default function Page() {
  return (
    <>
      <Navbar />

      <Hero />

      {/* Feature Section */}
      <div className="bg-white text-black py-24 px-8 text-center">

        <h2 className="text-4xl font-bold mb-6">
          Why Choose Us?
        </h2>

        <p className="max-w-2xl mx-auto text-gray-600 mb-12">
          We provide fast, scalable and modern solutions using cutting-edge technologies.
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          <div className="p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold mb-3">⚡ Fast</h3>
            <p className="text-gray-500">
              Optimized performance for modern applications.
            </p>
          </div>

          <div className="p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold mb-3">📈 Scalable</h3>
            <p className="text-gray-500">
              Built to handle growth and expansion.
            </p>
          </div>

          <div className="p-8 rounded-xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-xl font-semibold mb-3">🚀 Modern</h3>
            <p className="text-gray-500">
              Uses latest technologies and best practices.
            </p>
          </div>

        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-100 py-20 px-8 text-center">

        <h2 className="text-3xl font-bold mb-6">
          Contact Us
        </h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.target as any;

            const formData = {
              name: form.name.value,
              email: form.email.value,
            };

            const res = await fetch("/api/contact", {
              method: "POST",
              body: JSON.stringify(formData),
            });

            const data = await res.json();

            alert(data.message);
          }}
          className="max-w-md mx-auto flex flex-col gap-4"
        >

          <input
            name="name"
            placeholder="Your Name"
            className="p-3 rounded border"
            required
          />

          <input
            name="email"
            placeholder="Your Email"
            className="p-3 rounded border"
            required
          />

          <button className="bg-black text-white py-3 rounded">
            Submit
          </button>

        </form>
      </div>

      {/* Footer */}
      <div className="bg-black text-white py-6 text-center">
        <p className="text-sm text-gray-400">
          © 2026 MyProject. All rights reserved.
        </p>
      </div>
    </>
  );
}