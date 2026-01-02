import { useEffect, useState } from "react";
import { getToken } from "../../../utils/auth";
import { getSafMstrDataApi } from "../../../api/endpoints";
import _ from "lodash";
import AssessmentForm from "../component/AssessmentForm";
import { Spinner } from "@nextui-org/react";

const AddExisitingHolding = () => {
  const token = getToken();
  const [isLoading, setIsLoading] = useState(true);
  const [mstrData, setMstrData] = useState([]);

  useEffect(() => {
    const fetchSafData = async () => {
      try {
        const res = await axios.post(
          getSafMstrDataApi,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.status === true) {
          setMstrData(res.data.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchSafData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="loading">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg mx-auto p-6 border rounded-lg container-fluid">
      <AssessmentForm
        mstrData={mstrData}
        isLoading={isLoading}
        propDetails={propDetails}
        token={token}
      />
    </div>
  );
};

export default AddExisitingHolding;
