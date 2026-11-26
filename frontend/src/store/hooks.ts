import { UseDispatch,useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState,AppDispatch } from "./index";

export const useAppDispatch =()=>useAppDispatch<AppDispatch>();
export const useAppSelector:TypedUseSelectorHook<RootState>=useSelector;