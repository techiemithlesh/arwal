const PropertyDetails = ({ data }) => {
  if (!data) return null;

  const {
    wardNo,
    newWardNo,
    assessmentType,
    propertyType,
    ownershipType,
    roadWidth,
    plotNo,
    areaOfPlot,
    rainWaterHarvesting,
    propAddress,
    zone,
    newHoldingNo,
    holdingNo,
    holdingType,
  } = data;

  const fields = [
    { label: "Ward No", value: wardNo },
    { label: "New Holding No", value: newHoldingNo },
    { label: "New Ward No", value: newWardNo },
    { label: "Old Holding No", value: holdingNo },
    { label: "Assessment Type", value: assessmentType },
    { label: "Plot No", value: plotNo },
    { label: "Property Type", value: propertyType },
    { label: "Area of Plot", value: areaOfPlot },
    { label: "Ownership Type", value: ownershipType },
    {
      label: "Rain Water Harvesting",
      value: rainWaterHarvesting === true ? "Yes" : "No",
    },
    { label: "Holding Type", value: holdingType },
    { label: "Address", value: propAddress },
    { label: "Road Type", value: roadWidth },
    { label: "Zone", value: zone },
    { label: "Entry Type", value: zone },
  ];

  const isMutation = assessmentType?.toLowerCase() === "mutation";
  const visibleFields = fields.filter((field) => {
    if (field.label === "Road Type" && isMutation) return false;
    return true;
  });

  return (
    <div className="bg-white shadow border border-blue-800 rounded-lg">
      <div className="bg-blue-900 px-4 py-2 rounded-t-md font-bold text-white">
        Property Details
      </div>
      <div className="gap-2 grid grid-cols-1 md:grid-cols-2 p-4">
        {visibleFields.map((field, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-medium text-gray-600">{field.label} :</span>{" "}
            <span className="font-semibold text-black">
              {field.value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyDetails;
