import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../common/constant/app.constant.js";

export const tokenService = {
  createTokens: (acc) => {
    const payload = {
      A_ID: acc.A_ID,
      R_Name: acc.Role?.R_Name,
      M_ID: acc.M_ID,
      D_ID: acc.Member?.D_ID || null,
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  },
};
export default tokenService;
