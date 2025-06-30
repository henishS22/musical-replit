import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useMutation } from "@apollo/client";
import moment from "moment"; // Import moment for date formatting
import { GRAPH_MUTATION } from "graphql/mutation/admin";
import TopBar from "./Filterbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

function Graph() {
  const [updateRevenueTrackingDashboard] = useMutation(GRAPH_MUTATION);
  const [interval, setInterval] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [], // x-axis labels
    adminProfit: [], // y-axis data
  });

  useEffect(() => {
    const updateRevenueTracking = async () => {
      setLoading(true);
      try {
        const { data } = await updateRevenueTrackingDashboard({
          variables: {
            input: {
              interval,
            },
          },
        });

        const monthlyData = data.graph.graphdata[0].arrMonth;

        // Prepare the data based on the interval
        const labels = [];
        const adminProfitData = [];

        Object.values(monthlyData).forEach((monthData) => {
          if (monthData && monthData.datetime) {
            let label = "";

            // Dynamically create labels based on interval
            if (interval === "daily") {
              label = monthData.datetime;
            } else if (interval === "yearly") {
              label = moment(monthData.datetime, "YYYY-DD-MMM").format(
                "MMM YYYY"
              ); // Show month and year for yearly interval
            } else {
              label = moment(monthData.datetime, "YYYY-DD-MMM").format(
                "DD-MM-YYYY"
              );
            }

            labels.push(label);
            adminProfitData.push(monthData.value || 0);
          }
        });

        // Update the state with new chart data
        setChartData({
          labels,
          adminProfit: adminProfitData,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    updateRevenueTracking();
  }, [interval, updateRevenueTrackingDashboard]);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Admin Profit",
        data: chartData.adminProfit,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <>
      <TopBar
        interval={interval}
        setInterval={setInterval}
        loading={loading}
        title="Revenue"
      />
      <div
        style={{ height: "auto", padding: "20px 15px 0", fontSize: "1.5rem" }}
      >
        <Line options={options} data={data} />
      </div>
    </>
  );
}

export default Graph;
