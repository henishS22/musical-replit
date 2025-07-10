// "use client";

// import ConfettiExplosion from "react-confetti-explosion";
// import { Button } from "@nextui-org/react";
// import Image from "next/image";
// import { FILE_UPLOAD_SUCCESSFULLY } from "@/assets";

// interface FileUploadSuccessProps {
//   onGoToProject: () => void;
// }

// export function FileUploadSuccess({ onGoToProject }: FileUploadSuccessProps) {
//   return (
//     <div className="fixed inset-0 flex justify-center items-center ">
//         <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
//         {/* Confetti */}
//         <div className="absolute -top-4 -right-4">
//           <ConfettiExplosion
//             force={0.6}
//             duration={3000}
//             particleCount={50}
//             width={500}
//           />
//         </div>

//         {/* Success Logo */}
//         <div className="flex justify-center items-center mb-6">
//           <div className="w-16 h-16 rounded-full  flex items-center justify-center">
//             <Image
//               src={FILE_UPLOAD_SUCCESSFULLY}
//               alt="File Uploaded Successfully"
//               width={50}
//               height={50}
//               className="object-contain"
//             />
//           </div>
//         </div>

//         {/* Message */}
//         <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
//           File Uploaded successfully
//         </h3>

//         {/* Button */}
//         <div className="flex justify-center">
//           <Button
//             onPress={onGoToProject}
//             className="bg-btnColor hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow-md"
//           >
//             Go to Project
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
