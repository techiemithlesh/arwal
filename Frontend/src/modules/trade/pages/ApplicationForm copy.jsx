import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layout/AdminLayout";
import FormLayout from "../components/FormLayout";
import FormSection from "../components/FormSection";
import axios from "axios";
import toast from "react-hot-toast";
import {
  fetchTradeMstrData,
  fetchNewWardByOldWard,
  preparePayload,
} from "../../../utils/commonFunc";
import { getToken } from "../../../utils/auth";
import {
  tradeApplicationDetailsApi,
  validateHoldingNoApi,
  getTradeTaxDetailsApi,
  testTradePayloadApi,
} from "../../../api/endpoints";
import {
  setTradeFormData,
  updateFormField,
  updateOwnerDetail,
  addOwner,
  deleteOwner,
} from "../../../store/slices/tradeSlice";
import { validateFormFields } from "../../../utils/formValidator";

const ApplicationForm = ({ mode = "new" }) => {
  console.log("mode", mode);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const debounceTimer = useRef(null);
  const token = getToken();

  const formData = useSelector((state) => state.trade.tradeFormData);
  const isEditable = mode === "new";

  const [mstrData, setMstrData] = useState({});
  const [newWardList, setNewWardList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // 🔹 Fetch master data
  useEffect(() => {
    fetchTradeMstrData(setMstrData, token, {}, setLoading);
  }, [token]);

  // 🔹 Fetch new ward list dynamically
  useEffect(() => {
    if (formData.wardMstrId)
      fetchNewWardByOldWard(formData.wardMstrId, token).then(setNewWardList);
  }, [formData.wardMstrId]);

  // 🔹 Fetch existing application if editing
  useEffect(() => {
    if (id) fetchExistingApplication();
    // eslint-disable-next-line
  }, [id]);

  const fetchExistingApplication = async () => {
    try {
      const res = await axios.post(
        tradeApplicationDetailsApi,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const appData = res.data?.data || {};
      dispatch(
        setTradeFormData({
          ...formData,
          ...appData,
          ownerDtl:
            appData.owners?.length > 0
              ? appData.owners.map((o) => ({
                  ownerName: o.ownerName ?? "",
                  guardianName: o.guardianName ?? "",
                  mobileNo: o.mobileNo ?? "",
                  emailId: o.email ?? "",
                }))
              : formData.ownerDtl,
          natureOfBusiness: appData.tradeItem?.map((t) => t.id) || [],
        })
      );
    } catch (err) {
      toast.error("Failed to fetch application details");
      console.error(err);
    }
  };

  // 🔹 Validate holding number and prefill data
  const validateHoldingNo = async (holdingNo) => {
    if (!holdingNo) return;
    try {
      const response = await axios.post(
        validateHoldingNoApi,
        { holdingNo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.status) {
        const details = response?.data?.data;
        toast.success("Valid Holding Number", { position: "top-right" });

        dispatch(
          setTradeFormData({
            ...formData,
            holdingNo,
            wardMstrId: details?.wardMstrId,
            newWardMstrId: details?.newWardMstrId,
            ownerDtl: details?.owners || formData.ownerDtl,
            address: details?.address || formData.address,
            pinCode: details?.pinCode || formData.pinCode,
          })
        );
      } else {
        toast.error("Invalid Holding Number", { position: "top-right" });
        setErrors({ holdingNo: "Invalid Holding No" });
        dispatch(updateFormField({ name: "holdingNo", value: "" }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 Auto-fetch tax details when related fields change
  const fetchTaxDetails = async () => {
    try {
      const payload = {
        applicationType: formData.applicationType,
        firmEstablishmentDate: formData.firmEstablishmentDate,
        areaInSqft: formData.areaInSqft,
        licenseForYears: formData.licenseForYears,
        isTobaccoLicense: 0,
      };

      const response = await axios.post(getTradeTaxDetailsApi, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.data) {
        dispatch(setTradeFormData({ ...formData, ...response.data.data }));
      }
    } catch (error) {
      console.error("Error fetching tax details:", error);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (
      formData.firmEstablishmentDate &&
      formData.areaInSqft &&
      formData.licenseForYears
    ) {
      debounceTimer.current = setTimeout(() => {
        fetchTaxDetails();
      }, 500);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [
    formData.firmEstablishmentDate,
    formData.areaInSqft,
    formData.licenseForYears,
  ]);

  // 🔹 Handle input change (clears errors + dispatch)
  const handleInputFieldChange = (name, value, index = null) => {
    console.log("sdlkfs", name, value, index);
    setErrors((prev) => {
      const updated = { ...prev };
      if (index !== null) {
        delete updated[`ownerDtl[${index}].${name}`];
        delete updated[name];
      } else {
        delete updated[name];
      }
      return updated;
    });

    if (index !== null) {
      dispatch(updateOwnerDetail({ index, name, value }));
    } else {
      dispatch(updateFormField({ name, value }));
    }
  };

  // 🔹 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFields = [
      ...applyLicenseFields,
      ...firmFields,
      {
        name: "ownerDtl",
        label: "Owner Details",
        nestedFields: ownerFields,
      },
      ...licenseYearFields,
      {
        name: "natureOfBusiness",
        label: "Nature of Business",
        required: true,
        isMulti: true,
      },
    ];

    const clientErrors = validateFormFields(allFields, formData);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      toast.error("Please fix the highlighted errors");
      return;
    }

    try {
      const payload = preparePayload(formData);
      const res = await axios.post(testTradePayloadApi, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.status !== true) {
        setErrors(res.data.errors || {});
      } else {
        toast.success(res.data.message, { position: "top-right" });
        navigate("/trade/application-preview", {
          state: { mstrData },
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // 🔹 Field definitions
  const applyLicenseFields = [
    {
      name: "applicationType",
      label: "Application Type",
      type: "select",
      options: [
        { value: "NEW LICENSE", label: "New License" },
        { value: "RENEWAL", label: "Renew License" },
        { value: "AMENDMENT", label: "Amendment" },
        { value: "SURRENDER", label: "Surrender" },
      ],

      required: true,
    },
    {
      name: "firmTypeId",
      label: "Firm Type",
      type: "select",
      options: (mstrData.firmType || []).map((f) => ({
        value: f.id,
        label: f.firmType,
      })),
      required: true,
    },
    {
      name: "ownershipTypeId",
      label: "Ownership Type",
      type: "select",
      options: (mstrData.ownershipType || []).map((f) => ({
        value: f.id,
        label: f.ownershipType,
      })),
      required: true,
    },
  ];

  const firmFields = [
    {
      name: "holdingNo",
      label: "Holding No",
      type: "text",
      required: true,
      onBlur: (e) => validateHoldingNo(e.target.value),
      error: errors.holdingNo,
    },
    {
      name: "wardMstrId",
      label: "Ward No",
      type: "select",
      options: (mstrData.wardList || []).map((f) => ({
        value: f.id,
        label: f.wardNo,
      })),
      required: true,
    },
    {
      name: "newWardMstrId",
      label: "New Ward No",
      type: "select",
      options: (newWardList || []).map((f) => ({
        value: f.id,
        label: f.wardNo,
      })),
      required: true,
    },
    { name: "firmName", label: "Firm Name", type: "text", required: true },
    {
      name: "firmEstablishmentDate",
      label: "Establishment Date",
      type: "date",
      required: true,
    },
    {
      name: "areaInSqft",
      label: "Total Area (sq. ft.)",
      type: "number",
      required: true,
    },
    {
      name: "address",
      label: "Business Address",
      type: "text",
      required: true,
    },
    { name: "landmark", label: "Landmark", type: "text" },
    { name: "pinCode", label: "Pin Code", type: "text", required: true },
    {
      name: "premisesOwnerName",
      label: "Owner of Business Premises",
      type: "text",
      required: true,
    },
    {
      name: "firmDescription",
      label: "Business Description",
      type: "text",
      required: true,
    },
  ];

  const ownerFields = [
    { name: "ownerName", label: "Owner Name", required: true },
    { name: "guardianName", label: "Guardian Name" },
    { name: "mobileNo", label: "Mobile No", required: true },
    { name: "emailId", label: "Email", type: "email" },
  ];

  const licenseYearFields = [
    {
      name: "licenseForYears",
      label: "License Required For",
      type: "select",
      required: true,
      options:
        mstrData.licenseForYears ||
        [...Array(10)].map((_, i) => ({
          label: `${i + 1} Year${i > 0 ? "s" : ""}`,
          value: String(i + 1),
        })),
    },
    { name: "licenseCharge", label: "Charge Applied", type: "text" },
    { name: "arrearCharge", label: "Arrears", type: "text" },
    { name: "currentCharge", label: "Current Charge", type: "text" },
    { name: "latePenalty", label: "Penalty", type: "text" },
    { name: "totalCharge", label: "Total Charge", type: "text" },
  ];

  if (loading)
    return (
      <AdminLayout>
        <div className="p-10 text-center text-gray-600">Loading...</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-4 px-2">
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Apply License */}
          <FormSection title="Apply License">
            <FormLayout
              fields={applyLicenseFields.map((f) => ({
                ...f,
                value: formData?.[f.name] || "",
                error: errors[f.name],
              }))}
              onChange={handleInputFieldChange}
              isEditable={isEditable}
              columns={3}
            />
          </FormSection>

          {/* Firm Details */}
          <FormSection title="Firm Details">
            <FormLayout
              fields={firmFields.map((f) => ({
                ...f,
                value: formData?.[f.name] || "",
                error: errors[f.name],
              }))}
              onChange={handleInputFieldChange}
              isEditable={isEditable}
              columns={3}
            />
          </FormSection>

          {/* Owner Details */}
          <FormSection title="Owner Details">
            <div className="space-y-4">
              {(formData.ownerDtl || []).map((owner, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <FormLayout
                      fields={ownerFields.map((f) => ({
                        ...f,
                        value: owner?.[f.name] || "",
                        error:
                          errors[`ownerDtl[${idx}].${f.name}`] ||
                          errors[f.name] ||
                          "",
                      }))}
                      onChange={(name, value) =>
                        handleInputFieldChange(name, value, idx)
                      }
                      isEditable={isEditable}
                      columns={4}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => dispatch(addOwner())}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Add
                    </button>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => dispatch(deleteOwner(idx))}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Nature of Business */}
          <FormSection title="Nature of Business">
            <FormLayout
              fields={[
                {
                  name: "natureOfBusiness",
                  value: (formData?.natureOfBusiness || [])?.map(
                    (item) => item?.tradeItemTypeId || item
                  ),
                  label: "Nature of Business",
                  type: "select",
                  options: (mstrData.itemType || []).map((f) => ({
                    value: f.id,
                    label: f.tradeItem,
                  })),
                  required: true,
                  isMulti: true,
                  error: errors["natureOfBusiness"],
                },
              ]}
              onChange={handleInputFieldChange}
              isEditable={isEditable}
              columns={2}
            />
          </FormSection>

          {/* License Year */}
          <FormSection title="License Required for the Year">
            <FormLayout
              fields={licenseYearFields.map((f) => ({
                ...f,
                value: formData?.[f.name],
                error: errors[f.name],
              }))}
              onChange={handleInputFieldChange}
              isEditable={isEditable}
              columns={2}
            />
          </FormSection>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
            >
              Preview
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ApplicationForm;
