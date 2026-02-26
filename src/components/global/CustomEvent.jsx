const CustomEvent = ({ event }) => {
  return (
    <div style={{
      whiteSpace: 'normal',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
      padding: '5px'
    }}>
      <strong>{event.title}</strong>
      <div>{event.description}</div>
    </div>
  );
};

export default CustomEvent;
