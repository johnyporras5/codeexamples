import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "api/api";
import { loginReset } from "redux/slice/authentication";
import { GeographicRoute } from "model/geographic-route";
import { arrayToById, objectToById } from "redux/normalize";

export interface geoLeadRoutingsState {
	loading?: boolean;
	error?: string | null;
	byId: {
		[key: number]: geoLeadRoutingState;
	};
};

export interface geoLeadRoutingState {
	id: number;
	name: string;
	status: string;
	description?: string;
};

const initialState: geoLeadRoutingsState = {
	byId: {},
};

const fetchGeoLeadRouting = createAsyncThunk("leadRouting/fetchGeoLeadRouting", async (payload, thunkAPI) => {
	thunkAPI.dispatch(geoLeadRoutingsLoading());
	const result = api.getGeoLeadRoutings();
	result
		.then((geoLeadRoutings) => thunkAPI.dispatch(leadRoutingsLoaded(geoLeadRoutings)))
		.catch(error => thunkAPI.dispatch(leadRoutingFailed(error)));
	return result;
});

const saveGeoLeadRouting = createAsyncThunk("leadRouting/SavegeoLeadRouting", async (payload:{geoleadrouting: GeographicRoute}, thunkAPI) => {
	thunkAPI.dispatch(geoLeadRoutingsLoading());
	const result = api.saveGeoLeadRouting(payload.geoleadrouting);
	result
		.then(leadrouting => thunkAPI.dispatch(geoLeadRoutingsLoading()))
		.catch(error => thunkAPI.dispatch(leadRoutingFailed(error)));
	return result;
});

export const geographicRouteSlice = createSlice({
  name: "leadroutings",
  initialState,
  reducers: {
	geoLeadRoutingsLoading: (state) => {
		state.loading = true;
	},
	leadRoutingsLoaded: (state, action: PayloadAction<any[]>) => {
		state.loading = false;
		state.error = null;
		state.byId = arrayToById(action.payload, "id");
	},
	leadRoutingFailed: (state, action: PayloadAction<any>) => {
		state.loading = false;
		state.error = action.payload.message;
	},
	leadRoutingLoaded: (state, action: PayloadAction<any>) => {
		const byId = objectToById(action.payload, "id");
		state.loading = false;
		state.error = null;
		state.byId = { 
			...state.byId,
			...byId,
		};
	},
	default:() => {
		return;
	}
  }, 
  extraReducers(builder) {
		builder.addCase(loginReset, () => {
			return initialState;
		});
	},
});

const { leadRoutingsLoaded, leadRoutingFailed, geoLeadRoutingsLoading, leadRoutingLoaded } = geographicRouteSlice.actions;
export { geoLeadRoutingsLoading, saveGeoLeadRouting };