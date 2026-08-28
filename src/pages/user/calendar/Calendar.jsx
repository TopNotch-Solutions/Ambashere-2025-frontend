import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Box, Typography, Button, Tooltip, CircularProgress } from "@mui/material";
import Header from "../../../components/admin/Header";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector } from "react-redux";
import {
  buildAirtimeContractCalendarEvents,
  buildHandsetContractCalendarEvents,
  CALENDAR_EVENT_COLORS,
} from "../../../utils/calendarContractEvents";
import "../../../assets/style/global/userCalendar.css";

const localizer = momentLocalizer(moment);

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
    eventType: "admin",
  };
};

const UserCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser?.EmployeeCode) return;

      try {
        setIsLoading(true);
        const [eventsResponse, airtimeResponse, handsetResponse] =
          await Promise.all([
            axiosInstance.get("/events"),
            axiosInstance.get(`/contracts/${currentUser.EmployeeCode}`),
            axiosInstance.get(`/handsets/${currentUser.EmployeeCode}`),
          ]);

        const adminEvents = (eventsResponse.data || []).map(formatApiEvent);
        const airtimeContracts = Array.isArray(airtimeResponse.data?.contracts)
          ? airtimeResponse.data.contracts
          : [];
        const handsetList = Array.isArray(handsetResponse.data?.handsets)
          ? handsetResponse.data.handsets
          : Array.isArray(handsetResponse.data)
            ? handsetResponse.data
            : [];

        const contractEvents = [
          ...buildAirtimeContractCalendarEvents(airtimeContracts),
          ...buildHandsetContractCalendarEvents(handsetList),
        ];

        setEvents([...adminEvents, ...contractEvents]);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser?.EmployeeCode]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const getEventColor = (event) =>
    CALENDAR_EVENT_COLORS[event?.eventType] || CALENDAR_EVENT_COLORS.admin;

  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: getEventColor(event),
      borderColor: getEventColor(event),
      color: "#ffffff",
      borderRadius: "4px",
      border: "none",
      fontSize: "0.82rem",
    },
  });

  const EventRenderer = ({ event }) => (
    <Tooltip title={event.description || event.title} arrow>
      <div style={{ color: getEventColor(event), fontWeight: 600 }}>
        • {event.title}
      </div>
    </Tooltip>
  );

  const legendItems = [
    { label: "Airtime contract start", type: "airtime-start" },
    { label: "Airtime contract end", type: "airtime-end" },
    { label: "Handset contract start", type: "handset-start" },
    { label: "Handset contract end", type: "handset-end" },
    { label: "Company events", type: "admin" },
  ];

  return (
    <div className="calendar-container user-calendar-page">
      <Header title="Calendar" />

      <div className="user-calendar-legend">
        {legendItems.map((item) => (
          <span key={item.type} className="user-calendar-legend-item">
            <span
              className="user-calendar-legend-dot"
              style={{ backgroundColor: CALENDAR_EVENT_COLORS[item.type] }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {isLoading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="500px"
          sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}
        >
          <Box textAlign="center">
            <CircularProgress size={40} sx={{ color: "#0096D6" }} />
            <Typography variant="h6" sx={{ mt: 2, color: "#666" }}>
              Loading calendar events...
            </Typography>
          </Box>
        </Box>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, width: "100%" }}
          selectable
          onSelectEvent={handleEventClick}
          views={["month", "week", "day", "agenda"]}
          defaultView={Views.MONTH}
          toolbar={true}
          popup={true}
          resizable={true}
          eventPropGetter={eventPropGetter}
          components={{
            event: EventRenderer,
          }}
        />
      )}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {selectedEvent && (
            <>
              <Typography variant="h6" component="h2">
                {selectedEvent.title}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong>{" "}
                {moment(selectedEvent.start).format("dddd, D MMMM YYYY")}
              </Typography>
              {!selectedEvent.allDay && (
                <>
                  <Typography variant="body1">
                    <strong>Start:</strong>{" "}
                    {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a")}
                  </Typography>
                  <Typography variant="body1">
                    <strong>End:</strong>{" "}
                    {moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a")}
                  </Typography>
                </>
              )}
              {selectedEvent.description && (
                <Typography variant="body1">
                  <strong>Details:</strong> {selectedEvent.description}
                </Typography>
              )}
              <Button variant="outlined" onClick={handleModalClose}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default UserCalendar;
