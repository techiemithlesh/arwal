import { useState } from "react";
import toast from "react-hot-toast";

export default function DeactivateHoldingModal({ propDetails, onCloseModal }) {
  const [file, setFile] = useState(null);
  const [remark, setRemark] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleDeactivate = () => {
    if (!file) {
      toast.error("Please upload a document before deactivating.");
      return;
    }
    toast.success("Deactivation submitted!");
    onCloseModal();
  };

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-center py-10"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(255,255,255,0.1)",
      }}
    >
      <div className="z-10 relative bg-white shadow-2xl p-8 border border-blue-300 rounded-3xl w-full max-w-lg max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <h2 className="font-bold text-red-700 text-2xl text-center tracking-wide">
          Deactivate Holding
        </h2>

        {/* Property Info */}
        {/* <div className="bg-blue-50 shadow-sm mb-6 p-4 border border-blue-200 rounded-xl text-sm">
          <div className="gap-x-4 gap-y-2 grid grid-cols-2">
            <div>
              <span className="font-semibold text-blue-900">Holding No:</span>
              <span className="ml-2">{propDetails?.holdingNo || "NA"}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Owner:</span>
              <span className="ml-2">
                {propDetails?.owners?.[0]?.ownerName || "NA"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">
                Property Type:
              </span>
              <span className="ml-2">{propDetails?.propertyType || "NA"}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Khata No:</span>
              <span className="ml-2">{propDetails?.khataNo || "NA"}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">Plot No:</span>
              <span className="ml-2">{propDetails?.plotNo || "NA"}</span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-blue-900">Address:</span>
              <span className="ml-2">
                {propDetails?.propAddress || "NA"},{" "}
                {propDetails?.propCity || "NA"}, {propDetails?.propDist || "NA"}
                , {propDetails?.propState || "NA"},{" "}
                {propDetails?.propPinCode || "NA"}
              </span>
            </div>
          </div>
        </div> */}

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-md mb-6 p-5 border border-blue-200 rounded-2xl text-sm">
          <h3 className="flex items-center gap-2 mb-3 font-bold text-blue-800 text-lg">
            🏠 Property Details
          </h3>

          <div className="gap-x-6 gap-y-3 grid grid-cols-2">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Holding No
              </span>
              <span className="font-medium text-blue-900">
                {propDetails?.holdingNo || "NA"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Owner
              </span>
              <span className="font-medium text-blue-900">
                {propDetails?.owners?.[0]?.ownerName || "NA"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Property Type
              </span>
              <span className="font-medium text-blue-900">
                {propDetails?.propertyType || "NA"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Khata No
              </span>
              <span className="font-medium text-blue-900">
                {propDetails?.khataNo || "NA"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Plot No
              </span>
              <span className="font-medium text-blue-900">
                {propDetails?.plotNo || "NA"}
              </span>
            </div>

            <div className="flex flex-col col-span-2">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Address
              </span>
              <span className="font-medium text-blue-900 leading-relaxed">
                {propDetails?.propAddress || "NA"},{" "}
                {propDetails?.propCity || "NA"}, {propDetails?.propDist || "NA"}
                , {propDetails?.propState || "NA"},{" "}
                {propDetails?.propPinCode || "NA"}
              </span>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700 text-sm">
            Upload Document <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block file:bg-blue-600 file:hover:bg-blue-700 file:px-4 file:py-2 border border-gray-300 rounded-lg file:rounded-lg w-full file:font-semibold file:text-white text-sm transition cursor-pointer"
          />
          {file && (
            <p className="mt-2 font-medium text-blue-600 text-xs">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Remark */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700 text-sm">
            Remark <span className="text-red-500">*</span>
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter reason for deactivation..."
            className="shadow mt-1 p-3 border border-blue-300 focus:border-blue-500 rounded-lg focus:ring focus:ring-blue-200 w-full text-sm resize-none"
            rows={3}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={onCloseModal}
            className="bg-white hover:bg-gray-100 px-5 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeactivate}
            className="bg-gradient-to-r from-red-600 hover:from-red-700 to-red-500 hover:to-red-600 shadow px-5 py-2 rounded-lg font-bold text-white transition"
          >
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}
