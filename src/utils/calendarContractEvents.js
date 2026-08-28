import moment from "moment";
import formatDate from "../components/global/dateFormatter";

const toCalendarDayEvent = ({ date, title, description, id, eventType }) => {
  if (!date) return null;

  const parsed = moment(date);
  if (!parsed.isValid()) return null;

  return {
    start: parsed.clone().startOf("day").toDate(),
    end: parsed.clone().endOf("day").toDate(),
    title,
    description,
    id,
    eventType,
    allDay: true,
  };
};

export function buildAirtimeContractCalendarEvents(contracts = []) {
  const events = [];

  contracts
    .filter((contract) => !contract?.isSubmission)
    .forEach((contract, index) => {
      const packageName =
        contract?.PackageName || contract?.package || "Airtime Contract";
      const msisdn =
        contract?.msisdn || contract?.MSISDN || contract?.staff_msisdn || "";
      const baseId = contract?.id ?? index;
      const context = [packageName, msisdn].filter(Boolean).join(" — ");
      const startDate =
        contract?.contract_start_date ?? contract?.ContractStartDate;
      const endDate = contract?.contract_end_date ?? contract?.ContractEndDate;

      const startEvent = toCalendarDayEvent({
        date: startDate,
        title: "Airtime Contract Start",
        description: `Contract start date for ${context}.`,
        id: `airtime-start-${baseId}`,
        eventType: "airtime-start",
      });
      if (startEvent) events.push(startEvent);

      const endEvent = toCalendarDayEvent({
        date: endDate,
        title: "Airtime Contract End",
        description: `Contract end date for ${context}.`,
        id: `airtime-end-${baseId}`,
        eventType: "airtime-end",
      });
      if (endEvent) events.push(endEvent);
    });

  return events;
}

export function buildHandsetContractCalendarEvents(handsets = []) {
  const events = [];

  handsets
    .filter((handset) => !handset?.isSubmission)
    .forEach((handset, index) => {
      const handsetName =
        handset?.HandsetName || handset?.description || "Staff Handset";
      const baseId = handset?.id ?? index;
      const startDate = handset?.CollectionDate || handset?.collected_date;
      const endDate = handset?.RenewalDate || handset?.renewal_date;

      const startEvent = toCalendarDayEvent({
        date: startDate,
        title: "Handset Contract Start",
        description: `${handsetName} — contract start (date issued): ${formatDate(
          startDate
        )}.`,
        id: `handset-start-${baseId}`,
        eventType: "handset-start",
      });
      if (startEvent) events.push(startEvent);

      const endEvent = toCalendarDayEvent({
        date: endDate,
        title: "Handset Contract End",
        description: `${handsetName} — contract end (new handset date): ${formatDate(
          endDate
        )}.`,
        id: `handset-end-${baseId}`,
        eventType: "handset-end",
      });
      if (endEvent) events.push(endEvent);
    });

  return events;
}

export const CALENDAR_EVENT_COLORS = {
  "airtime-start": "#1565c0",
  "airtime-end": "#ef6c00",
  "handset-start": "#2e7d32",
  "handset-end": "#6a1b9a",
  admin: "#d32f2f",
};
