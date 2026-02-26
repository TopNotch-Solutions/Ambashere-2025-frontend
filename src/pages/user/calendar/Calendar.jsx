import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Box, Typography, Button, Tooltip, CircularProgress } from "@mui/material";
import Header from "../../../components/admin/Header";
import axiosInstance from "../../../utils/axiosInstance";
import { useSelector, useDispatch } from "react-redux";

const localizer = momentLocalizer(moment);

const UserCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/events");
        // console.log(response.data); // Ensure the data is correct
  
        const formattedEvents = response.data.map(event => {
          const eventStartDate = new Date(`${event.EventDate}T${event.EventTime}`);
          // If you don't have an explicit end time, you can add a duration (e.g., 1 hour) to calculate the end time
          const eventEndDate = new Date(eventStartDate);
          eventEndDate.setHours(eventEndDate.getHours() + 1); // Example: 1 hour duration
  
          return {
            start: eventStartDate,
            end: eventEndDate,
            title: event.EventName,
            description: event.EventDescription,
            id: event.EventID // Ensure you're using EventID for uniqueness
          };
        });
  
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  // Custom event renderer to show red dot with tooltip
  const EventRenderer = ({ event }) => (
    <Tooltip title={event.description} arrow>
      <div style={{ color: 'red', fontWeight: 'bold' }}>• {event.title}</div>
    </Tooltip>
  );

  return (
    <div className="calendar-container">
      <Header title="Calendar" />
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
          components={{
            event: EventRenderer, // Use custom event renderer
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
                View Event
              </Typography>
              <Typography variant="body1">
                <strong>Title:</strong> {selectedEvent.title}
              </Typography>
              <Typography variant="body1">
                <strong>Start:</strong>{" "}
                {moment(selectedEvent.start).format("MMMM Do YYYY, h:mm a")}
              </Typography>
              <Typography variant="body1">
                <strong>End:</strong>{" "}
                {moment(selectedEvent.end).format("MMMM Do YYYY, h:mm a")}
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong> {selectedEvent.description}
              </Typography>
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
