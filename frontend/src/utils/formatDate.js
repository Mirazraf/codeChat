const formatDate = (dateString) => {
	// Handle MongoDB's extended JSON date format { "$date": "..." }
	let dateInput = dateString;
	if (typeof dateString === 'object' && dateString !== null && '$date' in dateString) {
		dateInput = dateString.$date;
	}

	const messageDate = new Date(dateInput);
	const now = new Date();

	const isToday = messageDate.getDate() === now.getDate() &&
		messageDate.getMonth() === now.getMonth() &&
		messageDate.getFullYear() === now.getFullYear();

	if (isToday) {
		return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const isYesterday = messageDate.getDate() === yesterday.getDate() &&
		messageDate.getMonth() === yesterday.getMonth() &&
		messageDate.getFullYear() === yesterday.getFullYear();

	if (isYesterday) {
		return `Yesterday at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	}

	const oneWeekAgo = new Date(now);
	oneWeekAgo.setDate(now.getDate() - 7);

	if (messageDate > oneWeekAgo) {
		return `${messageDate.toLocaleDateString([], { weekday: 'long' })} at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	}

	return messageDate.toLocaleDateString([], {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

export default formatDate;