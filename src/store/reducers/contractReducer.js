import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  contractNumber: null,
  employeeCode: null,
  contractData: null,
};

const contractSlice = createSlice({
  name: 'contract',
  initialState,
  reducers: {
    setContract(state, action) {
      state.contractNumber = action.payload.contractNumber;
      state.employeeCode = action.payload.employeeCode;
    },
  },
});

export const { setContract } = contractSlice.actions;
export default contractSlice.reducer;
