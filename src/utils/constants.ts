export const SKILL_CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'business', label: 'Business' },
  { value: 'language', label: 'Language' },
  { value: 'music', label: 'Music' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'photography', label: 'Photography' },
  { value: 'writing', label: 'Writing' },
  { value: 'education', label: 'Education' },
  { value: 'art', label: 'Art' },
  { value: 'other', label: 'Other' },
];

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const REQUEST_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  accepted: { label: 'Accepted', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  completed: { label: 'Completed', color: 'blue' },
  cancelled: { label: 'Cancelled', color: 'gray' },
};

export const MEETING_TYPES = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In Person' },
  { value: 'flexible', label: 'Flexible' },
];

export const NOTIFICATION_TYPES = {
  skill_request: { label: 'Skill Request', icon: 'MessageSquare' },
  request_accepted: { label: 'Request Accepted', icon: 'CheckCircle' },
  request_rejected: { label: 'Request Rejected', icon: 'XCircle' },
  request_completed: { label: 'Request Completed', icon: 'Award' },
  message: { label: 'New Message', icon: 'Mail' },
  review_received: { label: 'Review Received', icon: 'Star' },
  skill_endorsed: { label: 'Skill Endorsed', icon: 'ThumbsUp' },
  system: { label: 'System', icon: 'Bell' },
};

export const DEFAULT_AVATAR = 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1';

export const PAGINATION_LIMITS = {
  skills: 12,
  requests: 10,
  messages: 50,
  notifications: 20,
  reviews: 10,
  users: 12,
};