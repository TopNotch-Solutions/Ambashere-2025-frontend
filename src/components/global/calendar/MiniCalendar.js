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
  { month: 2, day: 21, title: "Independence Day", description: "Public Holiday" },

  // April (Moveable Feasts - Dates below are standard for 2026)
  { month: 3, day: 3, title: "Good Friday", description: "Public Holiday" },
  { month: 3, day: 6, title: "Easter Monday", description: "Public Holiday" },

  // May
  { month: 4, day: 1, title: "Workers' Day", description: "Public Holiday" },
  { month: 4, day: 4, title: "Cassinga Day", description: "Public Holiday" },
  { month: 4, day: 14, title: "Ascension Day", description: "Public Holiday" },
  { month: 4, day: 25, title: "Africa Day", description: "Public Holiday" },

  // June
  { month: 5, day: 16, title: "Youth Day", description: "Public Holiday" },

  // August
  { month: 7, day: 26, title: "Heroes' Day", description: "Public Holiday" },

  // September
  { month: 8, day: 30, title: "Day of the Namibian Child", description: "Public Holiday" },

  // December
  { month: 11, day: 10, title: "International Human Rights Day and Namibian Women's Day", description: "Public Holiday" },
  { month: 11, day: 25, title: "Christmas Day", description: "Public Holiday" },
  { month: 11, day: 26, title: "Family Day", description: "Public Holiday" }
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


      });
    }

    return permanentEvents;
  };

  const formatApiEvent = (event) => {
    const eventTime =
      typeof event.EventTime === "string" && event.EventTime.length === 5
        ? `${event.EventTime}:00`
        : event.EventTime;
    const eventStartDate = new Date(`${event.EventDate}T${eventTime}`);
    const eventEndDate = new Date(eventStartDate);
    eventEndDate.setHours(eventEndDate.getHours() + 1);

    return {
      start: eventStartDate,
      end: eventEndDate,
      title: event.EventName,
      description: event.EventDescription,
      id: `event-${event.EventID}`,
      source: "admin",
    };
  };

  const generateRecurringEvents = () => {
    const recurringEvents = [];
    const now = moment();

    for (let i = 0; i < 12; i++) {
      recurringEvents.push({
        start: moment().date(14).add(i, "months").toDate(),
        end: moment().date(14).add(i, "months").toDate(),
        title: "Airtime is loaded today",
        recurring: true,
        id: `airtime-load-${i}`,
      });
    }

    const retrievedDate = moment("2022-07-01");
    const twoYearEventDate = retrievedDate.add(2, "years").toDate();
    recurringEvents.push({
      start: twoYearEventDate,
      end: twoYearEventDate,
      title: "Event every 2 years",
      recurring: true,
      id: "two-year-event",
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
        id: `monthly-two-year-${i}`,
      });
    }

    return recurringEvents;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events");
        const formattedEvents = (response.data || []).map(formatApiEvent);
        const permanentEvents = generatePermanentEvents();
        const recurringEvents = generateRecurringEvents();

        setEvents([...formattedEvents, ...permanentEvents, ...recurringEvents]);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([
          ...generatePermanentEvents(),
          ...generateRecurringEvents(),
        ]);
      }
    };

    fetchEvents();
  }, [currentUser?.EmployeeCode]);

  const getTileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = events.filter(
        (event) =>
          moment(event.start).format("YYYY-MM-DD") ===
          moment(date).format("YYYY-MM-DD")
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
              {dayEvents.map((event) => (
                <Box
                  key={event.id}
                  className={`event-dot ${
                    event.source === "admin" ? "event-dot-admin" : ""
                  }`}
                />
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
