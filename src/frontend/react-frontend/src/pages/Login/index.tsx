// src/pages/Login.tsx - Log in

import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserUpdateData } from '@/interfaces/User/UserUpdateData';
import { updateUser, getUserByName } from '@/services/userService';
import { authenticateUser } from "@/services/loginService";
import { toast } from 'react-toastify';
import { UserData } from '@/interfaces/User/UserData';

const Login: React.FC = () => {
  const userNameRef = useRef<HTMLInputElement | null>(null);
  const userPasswordRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null); 

  const login = async () => {
    try {
      const validateInput = (input: string | null, fieldName: string) => {
        if (fieldName === "帳號") {
          if (input === null || !/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(input)) {
            throw new Error(`帳號或密碼錯誤，請重新輸入`);
          }
        } else if (fieldName === "密碼") {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          if (input === null || !passwordRegex.test(input)) {
            toast.error(
              <div>
                {fieldName}必須包含大小寫英文、數字，且長度至少為8個字元
              </div>,
            );
            throw new Error(`${fieldName}必須包含大小寫英文、數字，且長度至少為8個字元`);
          }
        }
      };

      const userName = userNameRef.current?.value || null;
      const userPassword = userPasswordRef.current?.value || null;

      validateInput(userName, "帳號");
      validateInput(userPassword, "密碼");

      const users = await getUserByName(userName);

      const updatedUser: UserUpdateData = {
        isLoggedin: true,
      };

      try {
       
        const { user: auth, accessToken, refreshToken } = await authenticateUser(userName, userPassword);
        await updateUser(users[0]._id, updatedUser);

        // Store tokens
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);

        // Set currentUser state
        setCurrentUser(auth); 

        toast.success('登入成功！');
        navigate(`../../map/${auth.userName}`);
      } catch (error: any) {
        console.log(error);
        if (error.response && error.response.data) {
          const { error: errorMessage, failedLoginAttempts } = error.response.data;

          if (errorMessage.startsWith("帳號已被鎖定")) {
            toast.error(<div>{errorMessage}</div>);
          } else if (errorMessage === "帳號或密碼錯誤，請重新輸入") {
            if (failedLoginAttempts !== undefined) {
              const remainingAttempts = 5 - failedLoginAttempts;
              toast.error(
                <div>
                  帳號或密碼錯誤，您已經錯誤 {failedLoginAttempts} 次。再錯誤 {remainingAttempts} 次後帳號將被鎖定10分鐘。
                </div>,
              );
            } else {
              toast.error(<div>帳號或密碼錯誤，請重新輸入</div>);
            }
          } else {
            toast.error(<div>未知錯誤，請稍後再試</div>);
          }
        } else {
          toast.error(
            <div>
              帳號或密碼錯誤，請重新輸入
            </div>,
          );
        }
      }


    } catch(error) {
      if (error instanceof Error) {
        console.error("帳號或密碼錯誤，請重新輸入", error.message);
        toast.error(
          <div>
            帳號或密碼錯誤，請重新輸入
          </div>,
        );
      } else {
        console.error("發生未知錯誤");
        toast.error(
          <div>
            發生未知錯誤。
          </div>,
        );
      }
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#F7F1F0] to-[#C3A6A0]">
      <div className="w-[28rem] bg-white rounded-lg shadow-lg p-10 relative">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="text-base text-[#A15C38] hover:text-[#262220] font-medium transition-colors"
        >
          回到首頁
        </button>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-center text-[#262220] mb-8">
          登入
        </h2>

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <div className="mb-6">
            <label
              className="block text-base font-medium text-[#262220] mb-2"
              htmlFor="userName"
            >
              帳號
            </label>
            <input
              ref={userNameRef}
              id="userName"
              className="w-full px-5 py-3 border border-[#C3A6A0] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
              placeholder="輸入您的帳號"
              required
            />
          </div>
          <div className="mb-8">
            <label
              className="block text-base font-medium text-[#262220] mb-2"
              htmlFor="password"
            >
              密碼
            </label>
            <input
              type="password"
              ref={userPasswordRef}
              id="password"
              className="w-full px-5 py-3 border border-[#C3A6A0] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#A15C38]"
              placeholder="輸入您的密碼"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#A15C38] hover:bg-[#262220] text-white font-medium py-3 text-lg rounded-lg transition-colors"
          >
            登入
          </button>
        </form>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate("../../auth/reset-password")}
            className="text-base text-[#A15C38] hover:text-[#262220] font-medium transition-colors"
          >
            忘記密碼？
          </button>
          <button
            onClick={() => navigate("../../auth/register")}
            className="text-base text-[#A15C38] hover:text-[#262220] font-medium transition-colors"
          >
            註冊
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
