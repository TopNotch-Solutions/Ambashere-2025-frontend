import React, { useState, useEffect, useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import "../../../App.css";
import axiosInstance from "../../../utils/axiosInstance";
import Swal from "sweetalert2";
import { confirmAdminAction } from "../../../utils/adminConfirm";
import CustomEvent from "../../../components/global/CustomEvent";
import "../../../assets/style/global/handsetBenefitSimulator.css";
import "../../../assets/style/global/benefits.css";
import "../../../assets/style/global/adminCalendar.css";

const localizer = momentLocalizer(moment);

const buildDefaultHandsetMessage = (employeeName, eventDate) => {
  const name = String(employeeName || "").trim() || "there";
  const formattedDate = eventDate
    ? moment(eventDate).format("dddd, D MMMM YYYY")
    : "the selected date";

  return (
    `Hi ${name},\n\n` +
    `Your past handset benefit record has been reviewed and updated on Ambasphere.\n\n` +
    `Based on your previous handset allocation history, your new handset eligibility date is ${formattedDate}. ` +
    `On or after this date, you will be able to apply for a new staff handset through the benefits portal.\n\n` +
    `Your current device remains yours to keep. You will also receive reminder notifications as your new handset date approaches.\n\n` +
    `Visit the benefits portal: https://ambasphere.mtc.com.na`
  );
};

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState("12:00");
  const [recurrenceType, setRecurrenceType] = useState("None");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [isEdit, setIsEdit] = useState(false);
  const [notifyHandsetDate, setNotifyHandsetDate] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [notifyOnSave, setNotifyOnSave] = useState(true);

  const sortedStaff = useMemo(
    () =>
      [...staffOptions].sort((a, b) =>
        String(a.FullName || "").localeCompare(String(b.FullName || ""))
      ),
    [staffOptions]
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events");

        const formattedEvents = response.data.map((event) => {
          const start = new Date(`${event.EventDate}T${event.EventTime}`);
          const end = new Date(start);
          end.setHours(end.getHours() + 1);

          return {
            start,
            end,
            title: event.EventName,
            description: event.EventDescription,
            id: event.EventID,
            TargetEmployeeCode: event.TargetEmployeeCode || null,
            IsHandsetRenewal: Boolean(event.IsHandsetRenewal),
          };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    const fetchStaff = async () => {
      try {
        const response = await axiosInstance.get("/staffmember");
        setStaffOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching staff for calendar:", error);
        setStaffOptions([]);
      }
    };

    fetchEvents();
    fetchStaff();
  }, []);

  const resetForm = (start = new Date()) => {
    setEventName("");
    setEventDescription("");
    setEventDate(start);
    setEventTime("12:00");
    setRecurrenceType("None");
    setRecurrenceInterval(1);
    setSelectedEvent(null);
    setIsEdit(false);
    setNotifyHandsetDate(false);
    setSelectedEmployee(null);
    setNotifyOnSave(true);
  };

  const handleSelectSlot = ({ start }) => {
    resetForm(start);
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventName(event.title);
    setEventDescription(event.description || "");
    setEventDate(event.start);
    setEventTime(moment(event.start).format("HH:mm"));
    setRecurrenceType(event.RecurrenceType || "None");
    setRecurrenceInterval(event.RecurrenceInterval || 1);
    setIsEdit(true);
    setNotifyHandsetDate(Boolean(event.IsHandsetRenewal));
    setNotifyOnSave(false);
    const matched =
      sortedStaff.find(
        (staff) =>
          String(staff.EmployeeCode || "").replace(/[-\s]/g, "").toUpperCase() ===
          String(event.TargetEmployeeCode || "")
            .replace(/[-\s]/g, "")
            .toUpperCase()
      ) || null;
    setSelectedEmployee(matched);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleToggleHandsetNotify = (checked) => {
    setNotifyHandsetDate(checked);
    if (!checked) {
      setSelectedEmployee(null);
      return;
    }
    if (!eventName) {
      setEventName("New Handset Date");
    }
    if (selectedEmployee && !eventDescription) {
      setEventDescription(
        buildDefaultHandsetMessage(selectedEmployee.FullName, eventDate)
      );
    }
  };

  const handleEmployeeChange = (employee) => {
    setSelectedEmployee(employee);
    if (!notifyHandsetDate || !employee) return;
    setEventDescription(
      buildDefaultHandsetMessage(employee.FullName, eventDate)
    );
    if (!eventName) {
      setEventName(`New Handset Date — ${employee.FullName}`);
    }
  };

  const handleEventSave = async () => {
    if (!eventName || !eventDate || !eventTime) {
      Swal.fire({
        icon: "warning",
        title: "Missing details",
        text: "Event name, date, and time are required.",
      });
      return;
    }

    if (notifyHandsetDate && !selectedEmployee?.EmployeeCode) {
      Swal.fire({
        icon: "warning",
        title: "Select an employee",
        text: "Choose the employee who should receive the new handset date notification.",
      });
      return;
    }

    const confirmed = await confirmAdminAction({
      title: isEdit ? "Save event changes?" : "Create this event?",
      text: notifyHandsetDate
        ? `Set ${selectedEmployee.FullName}'s new handset date to ${moment(
            eventDate
          ).format("DD MMM YYYY")} and ${
            notifyOnSave ? "notify them now" : "save without re-notifying"
          }?`
        : isEdit
          ? `Update "${eventName}" on the calendar?`
          : `Add "${eventName}" to the calendar?`,
      confirmButtonText: isEdit ? "Save changes" : "Create event",
    });
    if (!confirmed) return;

    const [hours, minutes] = eventTime.split(":");
    const startDate = new Date(eventDate);
    startDate.setHours(hours);
    startDate.setMinutes(minutes);

    const eventData = {
      EventName: eventName,
      EventDescription: eventDescription,
      EventDate: moment(startDate).format("YYYY-MM-DD"),
      EventTime: eventTime,
      RecurrenceType: recurrenceType,
      RecurrenceInterval: recurrenceInterval,
      IsHandsetRenewal: notifyHandsetDate,
      TargetEmployeeCode: notifyHandsetDate
        ? selectedEmployee.EmployeeCode
        : null,
      NotifyEmployee: notifyHandsetDate ? notifyOnSave : false,
    };

    try {
      if (isEdit && selectedEvent) {
        const updatedEvent = await axiosInstance.put(
          `/events/updateEvent/${selectedEvent.id}`,
          eventData
        );
        const updatedStart = new Date(
          `${updatedEvent.data.EventDate}T${eventTime}`
        );
        const updatedEnd = new Date(updatedStart);
        updatedEnd.setHours(updatedEnd.getHours() + 1);

        setEvents(
          events.map((ev) =>
            ev.id === selectedEvent.id
              ? {
                  ...updatedEvent.data,
                  start: updatedStart,
                  end: updatedEnd,
                  title: updatedEvent.data.EventName,
                  description: updatedEvent.data.EventDescription,
                  id: updatedEvent.data.EventID || selectedEvent.id,
                  TargetEmployeeCode: updatedEvent.data.TargetEmployeeCode,
                  IsHandsetRenewal: Boolean(updatedEvent.data.IsHandsetRenewal),
                }
              : ev
          )
        );
      } else {
        const newEvent = await axiosInstance.post(
          "/events/createEvent",
          eventData
        );
        const createdStart = new Date(
          `${newEvent.data.EventDate}T${eventTime}`
        );
        const createdEnd = new Date(createdStart);
        createdEnd.setHours(createdEnd.getHours() + 1);

        setEvents([
          ...events,
          {
            ...newEvent.data,
            start: createdStart,
            end: createdEnd,
            title: newEvent.data.EventName,
            description: newEvent.data.EventDescription,
            id: newEvent.data.EventID,
            TargetEmployeeCode: newEvent.data.TargetEmployeeCode,
            IsHandsetRenewal: Boolean(newEvent.data.IsHandsetRenewal),
          },
        ]);
      }
      handleModalClose();
      Swal.fire({
        icon: "success",
        title: isEdit ? "Event updated" : "Event created",
        text: notifyHandsetDate
          ? "The new handset date is saved and will show for the employee and admins."
          : undefined,
        timer: notifyHandsetDate ? 2200 : 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error saving event:", error);
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text:
          error.response?.data?.message ||
          "Could not save the event. Please try again.",
      });
    }
  };

  const handleEventDelete = async () => {
    const confirmed = await confirmAdminAction({
      icon: "warning",
      title: "Delete this event?",
      text: `"${eventName || selectedEvent?.title || "This event"}" will be permanently removed.`,
      confirmButtonText: "Delete",
    });
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/events/deleteEvent/${selectedEvent.id}`);
      setEvents(events.filter((ev) => ev.id !== selectedEvent.id));
      handleModalClose();
      Swal.fire({
        icon: "success",
        title: "Event deleted",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Could not delete the event. Please try again.",
      });
    }
  };

  return (
    <div className="calendar-container handset-simulator-page admin-calendar-page">
      <div className="handset-hero mb-4">
        <div>
          <h2 className="handset-title">Calendar</h2>
          <p className="handset-subtitle mb-0">
            Schedule company events, or set a staff member&apos;s new handset
            date with in-app and email notification.
          </p>
        </div>
      </div>

      <div className="handset-form-card shadow-sm admin-calendar-card">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 620, width: "100%" }}
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
      </div>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "92%", md: "80%" },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderRadius: "12px",
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

          <FormControlLabel
            control={
              <Checkbox
                checked={notifyHandsetDate}
                onChange={(e) => handleToggleHandsetNotify(e.target.checked)}
              />
            }
            label="Set new handset date and notify employee"
          />

          {notifyHandsetDate && (
            <>
              <Autocomplete
                options={sortedStaff}
                getOptionLabel={(option) =>
                  `${option.FullName || "Unknown"} (${option.EmployeeCode || "-"})`
                }
                value={selectedEmployee}
                onChange={(_, value) => handleEmployeeChange(value)}
                isOptionEqualToValue={(option, value) =>
                  option.EmployeeCode === value.EmployeeCode
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee"
                    helperText="Event date becomes this employee's new handset / renewal date."
                  />
                )}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifyOnSave}
                    onChange={(e) => setNotifyOnSave(e.target.checked)}
                  />
                }
                label="Send in-app and email notification now"
              />
            </>
          )}

          <TextField
            label={
              notifyHandsetDate
                ? "Notification message (production wording)"
                : "Event Description"
            }
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            fullWidth
            multiline
            rows={notifyHandsetDate ? 8 : 3}
            helperText={
              notifyHandsetDate
                ? "Explains why their past handset record was updated and states the new eligibility date."
                : undefined
            }
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button className="benefits-cta-btn" onClick={handleEventSave}>
              Save
            </Button>
            {isEdit && (
              <Button className="benefits-cta-btn" onClick={handleEventDelete}>
                Delete
              </Button>
            )}
            <Button className="benefits-cta-btn" onClick={handleModalClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default AdminCalendar;
