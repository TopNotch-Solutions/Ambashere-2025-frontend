import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import "../../../App.css";
import Header from "../../../components/admin/Header";
import axiosInstance from "../../../utils/axiosInstance";
import CustomEvent from "../../../components/global/CustomEvent";

const localizer = momentLocalizer(moment);

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState("12:00");
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events");
        console.log("Fetched Events:", response.data); // Debugging log

        const formattedEvents = response.data.map((event) => ({
          start: new Date(`${event.EventDate}T${event.EventTime}`),
          end: new Date(`${event.EventDate}T${event.EventTime}`).setHours(
            new Date(`${event.EventDate}T${event.EventTime}`).getHours() + 1
          ),
          title: event.EventName,
          description: event.EventDescription,
          id: event.EventID, // Ensure EventID is mapped correctly
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start }) => {
    setEventName("");
    setEventDescription("");
    setEventDate(start);
    setEventTime("12:00");
    setRecurrenceType("none");
    setRecurrenceInterval(1);
    setSelectedEvent(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventName(event.title); // Use title from calendar event data
    setEventDescription(event.description || "");
    setEventDate(event.start); // Use start date from calendar event data
    setEventTime(moment(event.start).format("HH:mm"));
    setRecurrenceType(event.RecurrenceType || "none");
    setRecurrenceInterval(event.RecurrenceInterval || 1);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSave = async () => {
    // Basic validation to prevent null events
    if (!eventName || !eventDate || !eventTime) {
      alert("Event name, date, and time cannot be null.");
      return;
    }

    const [hours, minutes] = eventTime.split(":");
    const startDate = new Date(eventDate);
    startDate.setHours(hours);
    startDate.setMinutes(minutes);

    const eventData = {
      EventName: eventName,
      EventDescription: eventDescription,
      EventDate: startDate.toISOString(),
      EventTime: eventTime,
      RecurrenceType: recurrenceType,
      RecurrenceInterval: recurrenceInterval,
    };

    try {
      if (isEdit && selectedEvent) {
        const updatedEvent = await axiosInstance.put(
          `/events/updateEvent/${selectedEvent.id}`,
          eventData
        );
        setEvents(
          events.map((ev) =>
            ev.id === selectedEvent.id
              ? {
                  ...updatedEvent.data,
                  start: startDate,
                  end: new Date(startDate).setHours(startDate.getHours() + 1),
                  title: updatedEvent.data.EventName,
                  description: updatedEvent.data.EventDescription,
                }
              : ev
          )
        );
      } else {
        const newEvent = await axiosInstance.post(
          "/events/createEvent",
          eventData
        );
        setEvents([
          ...events,
          {
            ...newEvent.data,
            start: startDate,
            end: new Date(startDate).setHours(startDate.getHours() + 1),
            title: newEvent.data.EventName,
            description: newEvent.data.EventDescription,
          },
        ]);
      }
      handleModalClose();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEventDelete = async () => {
    try {
      await axiosInstance.delete(`/events/deleteEvent/${selectedEvent.id}`);
      setEvents(events.filter((ev) => ev.id !== selectedEvent.id));
      handleModalClose();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="calendar-container">
      <Header title="Calendar" />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, width: "100%" }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        views={["month", "week", "day", "agenda"]}
        defaultView={Views.MONTH}
        toolbar
        popup
        resizable
        components={{
    event: CustomEvent,
  }}
      />
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            {isEdit ? "Edit Event" : "Create Event"}
          </Typography>
          <div className="row">
            <div className="col">
              <TextField
                label="Event Title"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                fullWidth
              />
            </div>
            <div className="col">
              <TextField
                label="Event Time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300,
                }}
              />
            </div>
          </div>
          {/* <div className="row">
            <div className="col">
              <Select
                label="Recurrence Type"
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value)}
                fullWidth
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </div>
            <div className="col">
              <TextField
                label="Recurrence Interval"
                type="number"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value)}
                fullWidth
                disabled={recurrenceType === "none"}
              />
            </div>
          </div>
         */}
           <TextField
            label="Event Description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEventSave}
            >
              Save
            </Button>
            {isEdit && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleEventDelete}
              >
                Delete
              </Button>
            )}
            <Button variant="outlined" onClick={handleModalClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AdminCalendar;
