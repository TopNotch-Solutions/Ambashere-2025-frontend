// import CryptoJS from "crypto-js";
// import dotenv from "dotenv";

// // Load environment variables from .env file
// dotenv.config();

// // Get the secret key from the environment variables
// const SECRET_KEY = process.env.SECRET_KEY;

// // Encrypt function to securely store tokens
// export const encrypt = (data) => {
//   return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
// };

// // Decrypt function to retrieve tokens securely
// export const decrypt = (data) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   } catch (error) {
//     console.error("Decryption error:", error);
//     return null;
//   }
// };

// // Securely store the encrypted value in localStorage
// export const setSecureItem = (key, value) => {
//   const encryptedValue = encrypt(value);
//   localStorage.setItem(key, encryptedValue);
// };

// // Securely retrieve the decrypted value from localStorage
// export const getSecureItem = (key) => {
//   const item = localStorage.getItem(key);
//   return item ? decrypt(item) : null;
// };

// // Remove a token from localStorage
// export const removeSecureItem = (key) => {
//   localStorage.removeItem(key);
// };
