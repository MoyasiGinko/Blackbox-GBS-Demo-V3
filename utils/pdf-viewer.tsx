// "use client";

// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { ChevronsLeft, ChevronsRight, Eye, Loader, X } from "lucide-react";
// import { Dispatch, SetStateAction, useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";

// pdfjs.GlobalWorkerOptions.workerSrc =
//   "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";

// type Props = {
//   fileUrl: string;
//   hideIcon?: boolean;
//   open: boolean;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   disabled?: boolean
// };

// const PDFViewer = ({ fileUrl, hideIcon, open, setOpen, disabled }: Props) => {
//   const [numPages, setNumPages] = useState<number>(1);
//   const [currentPage, setCurrentPage] = useState(1);

//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages);
//     setCurrentPage(1); // Reset to the first page on load
//   };

//   const handlePreviousClick = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextClick = () => {
//     if (numPages && currentPage < numPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handleView = () => {
//     setOpen(false);
//   };

//   return (
//     <div>
//       {!hideIcon && (
//         <Button variant={"ghost"} className="p-0 m-0 h-6" disabled={disabled} onClick={handleView}>
//           <Eye size={"18"} strokeWidth={"3"} />
//         </Button>
//       )}

//       {open && (
//         <div className="fixed z-10 top-[5rem] left-1/2 transform -translate-x-1/2 h-[80vh] rounded-sm w-[90vw] lg:w-[60vw] bg-white dark:bg-black">
//           <div className="w-full h-full">
//             <div className="text-right">
//               <Button variant={"ghost"} onClick={handleView}>
//                 <X />
//               </Button>
//             </div>
//             <Separator />
//             <div className="mt-5 h-[80%] w-full flex justify-center overflow-hidden">
//               <Document
//                 className={
//                   "border-[3px] dark:border-slate-600 p-1 overflow-scroll shadow-md"
//                 }
//                 file={fileUrl}
//                 onLoadSuccess={onDocumentLoadSuccess}
//                 loading={
//                   <div className="w-full h-full flex items-center justify-center">
//                     <Loader className="animate-spin" />
//                   </div>
//                 }
//               >
//                 <Page pageNumber={currentPage} />
//               </Document>
//             </div>
//             <div className="flex space-x-4">
//               <Button
//                 asChild
//                 variant={"ghost"}
//                 className="p-0 m-5 text-primary absolute top-1/2 left-0 transform -translate-y-1/2 disabled:text-muted"
//                 onClick={handlePreviousClick}
//                 disabled={currentPage <= 1}
//               >
//                 <ChevronsLeft />
//               </Button>
//               {fileUrl && (
//                 <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
//                   Page {currentPage} of {numPages}
//                 </p>
//               )}

//               <Button
//                 asChild
//                 variant={"ghost"}
//                 className="p-0 m-5 text-primary absolute top-1/2 right-0 transform -translate-x-1/2"
//                 onClick={handleNextClick}
//                 disabled={currentPage >= numPages}
//               >
//                 <ChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PDFViewer;
