import { Link } from "react-router-dom";

export default function VerifySuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">ยืนยันอีเมลเรียบร้อยแล้ว</h1>
        <Link
          to="/login"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ไปล็อกอิน
        </Link>
      </div>
    </div>
  );
}

