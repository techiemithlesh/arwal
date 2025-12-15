import { motion } from "framer-motion";
import { modalVariants } from "../../../utils/motionVariable";
import { FaTimes } from "react-icons/fa";
import InputCard from "./InputCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchWardList } from "../../../store/slices/wardSlice";
import { propBasicEditApi } from "../../../api/endpoints";
import toast from "react-hot-toast";

export default function BasicEdit({ propDetails, onClose, token }) {
  const dispatch = useDispatch();
  const [propertyDetails, setPropertyDetails] = useState({
    id: "",
    newWardMstrId: "",
    wardMstrId: "",
    khataNo: "",
    plotNo: "",
    villageMaujaName: "",
    areaOfPlot: "",
    propAddress: "",
    propCity: "",
    propDist: "",
    propState: "",
    propPinCode: "",
    corrAddress: "",
    corrCity: "",
    corrDist: "",
    corrState: "",
    corrPinCode: "",
    remarks: "",
    document: "",
  });

  const [isCorrespondenceDifferent, setIsCorrespondenceDifferent] =
    useState(false);
  const { wardList = [], loading, error } = useSelector((state) => state.ward);

  const fields = {
    propertyDetails: [
      {
        label: "New Ward No",
        type: "wardSelect",
        name: "newWardMstrId",
        options: wardList,
      },
      {
        label: "Old Ward No",
        type: "wardSelect",
        name: "wardMstrId",
        options: wardList,
      },
      { label: "Khata No", type: "input", name: "khataNo" },
      { label: "Plot No", type: "input", name: "plotNo" },
      { label: "Village Mauja Name", type: "input", name: "villageMaujaName" },
      { label: "Area Of Plot", type: "input", name: "areaOfPlot" },
    ],
    propertyAddress: [
      { label: "Property Address", type: "textarea", name: "propAddress" },
      { label: "City", type: "input", name: "propCity" },
      { label: "District", type: "input", name: "propDist" },
      { label: "State", type: "input", name: "propState" },
      { label: "Pincode", type: "input", name: "propPinCode" },
    ],
    correspondenceAddress: [
      { label: "Property Address", type: "textarea", name: "corrAddress" },
      { label: "City", type: "input", name: "corrCity" },
      { label: "District", type: "input", name: "corrDist" },
      { label: "State", type: "input", name: "corrState" },
      { label: "Pincode", type: "input", name: "corrPinCode" },
      {
        label: "Reason For Update",
        type: "textarea",
        name: "remarks",
      },
      { label: "Document", type: "upload", name: "document" },
    ],
    ownerDetails: [
      { label: "Owner Name", type: "input", name: "ownerName" },
      { label: "Guardian Name", type: "input", name: "guardianName" },
      {
        label: "Relation",
        type: "select",
        name: "relationType",
        options: ["S/O", "D/O", "W/O", "C/O"],
      },
      { label: "Mobile", type: "input", name: "mobileNo" },
      { label: "Aadhaar No", type: "input", name: "aadharNo" },
      { label: "Email", type: "input", name: "email" },
      { label: "PAN No", type: "input", name: "panNo" },
      { label: "Supportive Document", type: "upload", name: "document" },
    ],
  };

  useEffect(() => {
    if (propDetails) {
      setPropertyDetails((prev) => ({
        ...prev,
        ...Object.keys(prev).reduce((acc, key) => {
          if (propDetails.hasOwnProperty(key)) {
            let value = propDetails[key];

            acc[key] = value;
          }
          return acc;
        }, {}),
      }));
    }
  }, [propDetails]);

  const handlePropertyDetailsSubmit = async () => {
    // Use FormData to send file(s)
    const formData = new FormData();
    Object.entries(propertyDetails).forEach(([key, value]) => {
      // Only append if value is not undefined or null
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    try {
      const response = await axios.post(propBasicEditApi, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (response && response.data && response.data.status) {
        toast.success("Property details updated successfully!");
        onClose && onClose();
      } else {
        toast.error("Failed to update property details.");
      }
    } catch (error) {
      console.error("Error submitting property details:", error);
      toast.error("An error occurred while updating property details.");
    }
  };

  useEffect(() => {
    dispatch(fetchWardList());
  }, [dispatch]);

  const handlePropDetails = (name, value) => {
    setPropertyDetails((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={modalVariants}
        transition={{ duration: 0.5 }}
        className="flex flex-col bg-white shadow-lg p-6 rounded-lg w-full max-w-6xl max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-blue-900 text-xl">Basic Edit</h2>
          <button
            className="text-gray-600 hover:text-red-600"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex flex-col flex-grow gap-4 rounded-t-xl overflow-scroll scrollbar-hide">
          <div className="flex flex-col border border-blue-900 rounded-t-xl">
            <h1 className="bg-blue-900 px-4 py-1 rounded-t-xl font-semibold text-white text-lg">
              Property Details
            </h1>
            <InputCard
              fields={fields.propertyDetails}
              values={propertyDetails}
              onChange={handlePropDetails}
            />
            <InputCard
              fields={fields.propertyAddress}
              title={"Property Address"}
              values={propertyDetails}
              onChange={handlePropDetails}
            />
            <div className="flex items-center gap-2 px-4 py-2">
              <input
                type="checkbox"
                id="correspondence-different"
                checked={isCorrespondenceDifferent}
                onChange={(e) => setIsCorrespondenceDifferent(e.target.checked)}
              />
              <label
                htmlFor="correspondence-different"
                className="text-gray-700"
              >
                If Corresponding Address Different from Property Address
              </label>
            </div>
            {isCorrespondenceDifferent && (
              <InputCard
                fields={fields.correspondenceAddress}
                title={"Correspondence Address"}
                values={propertyDetails}
                onChange={handlePropDetails}
              />
            )}
            <div className="flex justify-end mb-4 px-5">
              <button
                className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 px-4 rounded-full h-7 font-semibold text-white"
                onClick={handlePropertyDetailsSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
