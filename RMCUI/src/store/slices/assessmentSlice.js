import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {}
};

const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {
    setFormData(state, action) {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearForm(state) {
      state.formData = {};
    }
  }
});

export const { setFormData, clearForm } = assessmentSlice.actions;
export default assessmentSlice.reducer;
