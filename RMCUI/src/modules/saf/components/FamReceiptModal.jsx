import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { modalVariants } from "../../../utils/motionVariable";
import { FaPrint, FaTimes } from "react-icons/fa";
import jhakhandLog from "../../../assets/images/jharkhand_logo.png";
import QRCodeComponent from "../../../components/common/QRCodeComponent";
import { hostInfo } from "../../../utils/common";
import html2canvas from "html2canvas";

function FamReceiptModal({ id, onClose }) {
  const [isFrozen, setIsFrozen] = useState(false);
  const [receiptData, setReceiptData] = useState({});
  const [qurCode, setQurCode] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setIsFrozen(true);
    const host = hostInfo();
    setQurCode(
      <QRCodeComponent value={host + "/saf/fam-receipt/" + id} size={90} />
    );

    const dummyData = {
      holdingNo: "0540007574000A1",
      ownerName: "RANI PANDEY W/O JAYRAJ PANDEY",
      address:
        "F NO G 08 GROUND FLOOR MAHABIR GARDEN NEW PATEL COLONY, OBARIYA ROAD NO. 1, OBERIYA ROAD, HATIA, RANCHI RANCHI",
      memoNo: "FAM/054/406769/2018-2019",
      generatedAt: "2023-10-13 10:45 AM",
      taxBreakdown: [
        { taxType: "Holding Tax @ 2% (2018-2019)", amount: 1685.6 },
        { taxType: "Holding Tax @ 0.075% (2022-2023)", amount: 2469.6 },
        { taxType: "Holding Tax @ 2% (2024-2025)", amount: 2688 },
        { taxType: "Holding Tax @ 2% (2025-2026)", amount: 2688 },
      ],
      totalTaxAmount: 9531.2,
      description: "Final Assessment Memo (FAM) Receipt",
      ulbDtl: {
        ulbName: "Ranchi Municipal Corporation, Ranchi",
      },
      userDtl: {
        approvedBySign:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Facsimile_signature_of_John_Hancock.png/220px-Facsimile_signature_of_John_Hancock.png",
      },
      notes: [
        "Please verify all tax details carefully.",
        "In case of any discrepancy, contact the Municipal Office within 7 days.",
        "This receipt is valid only if issued by the authorized department.",
        "Retain this receipt for future reference.",
        "For any assistance, call the helpline numbers provided below.",
      ],
    };

    setReceiptData(dummyData);

    setIsFrozen(false);
  };

  const handlePrint = async () => {
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            @media print {
              @page {
                size: A4;
                margin: 10mm 15mm;
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" />
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <div className="z-50 print:static fixed inset-0 flex justify-center items-center bg-black print:bg-transparent bg-opacity-50 p-4 print:p-0">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={modalVariants}
        transition={{ duration: 0.5 }}
        className="flex flex-col bg-white shadow-lg print:shadow-none p-6 print:p-0 rounded-lg w-full print:max-w-full max-w-6xl max-h-[90vh]"
      >
        <div className="print:hidden flex justify-between items-center mb-4">
          <h2 className="font-semibold text-blue-900 text-xl">
            View FAM Receipt
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
            >
              Print
            </button>
            {onClose && (
              <button
                className="text-gray-600 hover:text-red-600"
                onClick={onClose}
              >
                <FaTimes size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="relative flex-grow print:overflow-visible overflow-y-auto">
          <div
            className={`${
              isFrozen ? "pointer-events-none filter blur-sm" : ""
            }`}
          >
            <div className="overflow-x-auto" ref={printRef}>
              <div className="bg-white p-6 print:p-2 border print:border-none font-sans text-sm print-container">
                <div className="mb-4 pb-4 border-b text-center">
                  <img
                    src={jhakhandLog}
                    alt="Logo"
                    className="mx-auto mb-2 w-20 h-20"
                  />
                  <h1 className="font-bold text-xl">
                    {receiptData?.ulbDtl?.ulbName}
                  </h1>
                  <h2 className="mt-3 font-semibold">
                    <span className="px-6 pt-1 pb-1 border-2 border-black">
                      {receiptData?.description}
                    </span>
                  </h2>
                </div>

                <div className="gap-4 grid grid-cols-2 mb-4">
                  <div>
                    <p>
                      Memo No.: <strong>{receiptData?.memoNo}</strong>
                    </p>
                    <p>
                      Holding No.: <strong>{receiptData?.holdingNo}</strong>
                    </p>
                    <p>
                      Generated On: <strong>{receiptData?.generatedAt}</strong>
                    </p>
                  </div>
                  <div>
                    <p>
                      Owner Name: <strong>{receiptData?.ownerName}</strong>
                    </p>
                    <p>
                      Address: <strong>{receiptData?.address}</strong>
                    </p>
                  </div>
                </div>

                <table className="mb-4 border w-full text-center border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-1 border">SL</th>
                      <th className="p-1 border">Tax Type</th>
                      <th className="p-1 border">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData?.taxBreakdown?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-1 border text-center">{idx + 1}</td>
                        <td className="p-1 border">{item.taxType}</td>
                        <td className="p-1 border text-right">
                          {item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        className="p-1 border font-semibold text-right"
                        colSpan="2"
                      >
                        Total Amount Payable
                      </td>
                      <td className="p-1 border font-bold text-right">
                        {receiptData?.totalTaxAmount}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between gap-6 mt-6">
                  <div>{qurCode}</div>
                  <div className="text-center">
                    <img
                      src={receiptData?.userDtl?.approvedBySign}
                      alt="Signature"
                      className="mx-auto mb-1 h-16"
                    />
                    <p className="text-sm">Authorized Signatory</p>
                  </div>
                </div>

                {/* Notes */}
                {receiptData?.notes?.length > 0 && (
                  <div className="mt-6 pt-4 border-t text-gray-700 text-sm">
                    <p className="mb-2 font-semibold">Note:</p>
                    <ol className="space-y-1 list-disc list-inside">
                      {receiptData?.notes?.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Footer */}
                <p className="mt-4 text-gray-500 text-xs text-center italic">
                  ** This is a computer-generated receipt and does not require
                  physical signature. **
                </p>
              </div>
            </div>
          </div>

          {isFrozen && (
            <div className="z-10 absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm">
              <div className="font-semibold text-gray-800 text-lg">
                Processing...
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default FamReceiptModal;
