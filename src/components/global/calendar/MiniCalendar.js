import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../assets/style/global/miniCalendar.css";
import { Text, Icon, Tooltip, Box } from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Card from "./Card";
import axiosInstance from "../../../utils/axiosInstance";
import moment from "moment";
import { useSelector } from "react-redux";

export default function MiniCalendar(props) {
  const { selectRange, ...rest } = props;
  const [value, onChange] = useState(new Date());
  const [events, setEvents] = useState([]);
  const currentUser = useSelector((state) => state.auth.user);

  // Function to generate recurring public holidays
  const generatePermanentEvents = () => {
    const permanentEvents = [];
    const currentYear = new Date().getFullYear();

    // Define public holidays that recur every year
    const holidays = [
      // January
      { month: 0, day: 1, title: "New Year's Day", description: "Public Holiday" },

      // March
      { month: 2, day: 21, title: "Independece Day", description: "Public Holiday" },
      { month: 2, day: 29, title: "Good Friday", description: "Public Holiday" },
      { month: 2, day: 31, title: "Easter Sunday", description: "Public Holiday" },

      // April
      { month: 3, day: 1, title: "Easter Monday", description: "Public Holiday" },

      // May
      { month: 4, day: 1, title: "Workers' Day", description: "Public Holiday" },
      { month: 4, day: 4, title: "Cassinga Day", description: "Public Holiday" },
      { month: 4, day: 9, title: "Christmas Day", description: "Public Holiday" },
      { month: 4, day: 25, title: "New Year's Day", description: "Public Holiday" },

      // August
      { month: 8, day: 25, title: "Heroes' Day", description: "Public Holiday" },

      // December
      { month: 11, day: 10, title: "Day of the Namibian Women and International Human Rights Day", description: "Public Holiday" },
      { month: 11, day: 25, title: "Christmas Day", description: "Public Holiday" },
      { month: 11, day: 26, title: "Family Day", description: "Public Holiday" },
    ];

    // Generate events for the next 10 years
    for (let year = currentYear; year < currentYear + 10; year++) {
      holidays.forEach((holiday, index) => {
        const eventStart = new Date(year, holiday.month, holiday.day);
        const eventEnd = new Date(year, holiday.month, holiday.day, 23, 59, 59); // All day event

        permanentEvents.push({
          start: eventStart,
          end: eventEnd,
          title: holiday.title,
          description: holiday.description,
          id: `holiday-${index}-${year}`, // Unique ID for each holiday event
          permanent: true, // Flag as permanent
        });

        // console.log("Permanent Events: ", permanentEvents);

      });
    }

    return permanentEvents;
  };

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await axiosInstance.get("/events");
        const formattedEvents = response.data.map((event) => {
          const eventStartDate = new Date(`${event.EventDate}T${event.EventTime}`);
          const eventEndDate = new Date(eventStartDate);
          eventEndDate.setHours(eventEndDate.getHours() + 1); // Assuming 1-hour duration
          return {
            start: eventStartDate,
            end: eventEndDate,
            title: event.EventName,
            description: event.EventDescription,
            id: event.EventID,
          };
        });
        const permanentEvents = generatePermanentEvents();
        // console.log("Permanent Events: ", permanentEvents);

        setEvents([...formattedEvents, ...permanentEvents]);
        return [...formattedEvents, ...permanentEvents];
      } catch (error) {
        // console.error("Error fetching events:", error);
        return [];
      }
    };

    // const fetchAirtimeData = async () => {
    //   try {
    //     const response = await axiosInstance.get(
    //       `/contracts/airtime/${currentUser.EmployeeCode}`
    //     );
    //     return response.data.airtimeData || [];
    //   } catch (error) {
    //     // console.log(error);
    //     return [];
    //   }
    // };

    // const fetchHandsetData = async () => {
    //   try {
    //     const response = await axiosInstance.get(
    //       `/contracts/handsets/${currentUser.EmployeeCode}`
    //     );
    //     return response.data.handsetData || [];
    //   } catch (error) {
    //     // console.log(error);
    //     return [];
    //   }
    // };

    const generateRecurringEvents = () => {
      const recurringEvents = [];
      const now = moment();

      for (let i = 0; i < 12; i++) {
        recurringEvents.push({
          start: moment().date(14).add(i, "months").toDate(),
          end: moment().date(14).add(i, "months").toDate(),
          title: "Airtime is loaded today",
          recurring: true,
        });
      }

      const retrievedDate = moment("2022-07-01");
      const twoYearEventDate = retrievedDate.add(2, "years").toDate();
      recurringEvents.push({
        start: twoYearEventDate,
        end: twoYearEventDate,
        title: "Event every 2 years",
        recurring: true,
      });

      for (let i = 0; i < 24; i++) {
        recurringEvents.push({
          start: moment(twoYearEventDate)
            .subtract(2, "years")
            .add(i, "months")
            .toDate(),
          end: moment(twoYearEventDate)
            .subtract(2, "years")
            .add(i, "months")
            .toDate(),
          title: "Monthly Event for 2-year item",
          recurring: true,
        });
      }

      return recurringEvents;
    };

    const fetchEvents = async () => {
      try {
        const [airtimeData, handsetData, allEvents] = await Promise.all([
          // fetchAirtimeData(),
          // fetchHandsetData(),
          fetchAllEvents(),
        ]);
        const recurringEvents = generateRecurringEvents();
        setEvents([...airtimeData, ...handsetData, ...allEvents, ...recurringEvents]);
      } catch (error) {
        // console.log(error);
      }
    };

    fetchEvents();
  }, [currentUser.EmployeeCode]);

  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = events.filter(
        (event) => new Date(event.start).toDateString() === date.toDateString()
      );
  
      if (dayEvents.length > 0) {
        return (
          <Tooltip
            label={dayEvents.map((event) => (
              <Box key={event.id} className="event-tooltip" p="10px" style={{ backgroundColor: "#0C1E33", color: "white" }}>
                <Text fontWeight="bold">{event.title}</Text>
                <Text>{event.description}</Text>
              </Box>
            ))}
            hasArrow
          >
            <Box className="event-day">
              {dayEvents.map((event, index) => (
                <Box key={index} className="event-dot" />
              ))}
            </Box>
          </Tooltip>
        );
      }
    }
    return null;
  };
  

  return (
    <Card
      align="center"
      direction="column"
      w="100%"
       maxW={{ base: "100%", sm: "100%", md: "420px", lg: "480px", xl: "520px" }}
      p="20px 15px"
      h="max-content"
      {...rest}
    >
      <Calendar
        onChange={onChange}
        value={value}
        selectRange={selectRange}
        view={"month"}
        tileContent={getTileContent}
        prevLabel={<Icon as={MdChevronLeft} w="24px" h="24px" mt="4px" />}
        nextLabel={<Icon as={MdChevronRight} w="24px" h="24px" mt="4px" />}
      />
    </Card>
  );
}
