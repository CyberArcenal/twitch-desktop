// // src/renderer/pages/stream/components/ChannelInfo.tsx
// import React from 'react';
// import { Verified } from 'lucide-react';
// import type { Stream } from '../../../api/core/streams';

// interface ChannelInfoProps {
//   channel: Stream;
// }

// const ChannelInfo: React.FC<ChannelInfoProps> = ({ channel }) => {
// const avatarUrl = channel.user_id
//   ? `https://static-cdn.jtvnw.net/jtv_user_pictures/${channel.user_id}-profile_image-70x70.png`
//   : './icon.png'; // or a local asset

//   return (
//     <div className="p-3 border-b border-[#2a2a2e]">
//       <div className="flex items-center gap-3">
//         <img
//           src={avatarUrl}
//           className="w-10 h-10 rounded-full"
//           alt={channel.user_name}
//         />
//         <div className="flex-1">
//           <div className="flex items-center gap-1">
//             <span className="font-bold text-white">{channel.user_name}</span>
//             <Verified className="w-4 h-4 text-[#9147ff]" />
//           </div>
//           <p className="text-sm text-[#adadb8] line-clamp-1">{channel.title}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChannelInfo;