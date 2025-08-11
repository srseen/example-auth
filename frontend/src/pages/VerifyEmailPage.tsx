import { Link, useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get("email");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">กรุณายืนยันอีเมลของคุณ</h1>
        {email && (
          <p className="mb-4">เราได้ส่งลิงก์ยืนยันไปที่ {email}</p>
        )}
        <p className="mb-4">โปรดตรวจสอบกล่องจดหมายของคุณและคลิกลิงก์ยืนยัน</p>
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
