import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function safeParseDescription(description) {
  if (!description) return "";
  const trimmed = description.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object') {
        return parsed.desc || parsed.description || description;
      }
    } catch (e) {
      // Ignore and fallback
    }
  }
  return description;
}

export function parseItemDetails(p) {
  if (!p) return { desc: "", location: "Campus Block", datetime: "Recent", contact: "", room: "", reporterName: "Anonymous Student" };
  
  let desc = p.description || "";
  let location = p.hostel || 'Campus Block';
  let datetime = p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
  let contact = '';
  let room = p.seller?.room ? `Room ${p.seller.room}, ${p.seller.hostel || p.hostel}` : p.hostel || '';
  let reporterName = p.seller?.name || 'Anonymous Student';

  const trimmedDesc = desc.trim();
  if (trimmedDesc.startsWith('{') || trimmedDesc.startsWith('[')) {
    try {
      const parsed = JSON.parse(desc);
      if (parsed && typeof parsed === 'object') {
        desc = parsed.desc || parsed.description || desc;
        location = parsed.location || location;
        datetime = parsed.datetime || datetime;
        contact = parsed.contact || contact;
        room = parsed.room || room;
      }
    } catch (e) {
      // Raw description fallback
    }
  }

  return {
    desc,
    location,
    datetime,
    contact,
    room,
    reporterName
  };
}
