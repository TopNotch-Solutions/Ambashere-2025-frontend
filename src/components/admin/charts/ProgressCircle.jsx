import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";

const ProgressCircle = ({ change }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getColorStyles = () => {
    if (change > 0) {
      return {
        backgroundColor: "lightgreen",
        borderColor: "green",
        iconColor: "green",
      };
    } else if (change < 0) {
      return {
        backgroundColor: "lightcoral",
        borderColor: "red",
        iconColor: "red",
      };
    } else {
      return {
        backgroundColor: "lightgray",
        borderColor: "gray",
        iconColor: "gray",
      };
    }
  };

  const { backgroundColor, borderColor, iconColor } = getColorStyles();
  const percentageChange = change !== null ? `${Math.abs(change)}%` : "0%";

  return (
    <Box
      sx={{
        width: { xs: "90px", sm: "100px", md: "110px", lg: "70px" },
        height: { xs: "30px", sm: "30px", md: "30px", lg: "30px" },
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px",
        paddingLeft: "12px",
        paddingRight: "12px",
        backgroundColor: backgroundColor,
      }}
    >
      <Box
        sx={{
          fontSize: { xs: "16px", sm: "16px", md: "16px", lg: "16px" },
          color: iconColor,
        }}
      >
        {change > 0 ? (
          <ArrowUpwardIcon />
        ) : change < 0 ? (
          <ArrowDownwardIcon />
        ) : (
          <HorizontalRuleIcon />
        )}
      </Box>
      <Typography
        variant="h6"
        sx={{ color: colors.grey[100], fontWeight: "bold" }}
      >
        {percentageChange}
      </Typography>
    </Box>
  );
};

export default ProgressCircle;
