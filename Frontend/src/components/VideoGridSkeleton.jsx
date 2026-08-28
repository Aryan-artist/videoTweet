const VideoGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="w-full aspect-video bg-[#272727] rounded-xl animate-pulse"></div>
          
          <div className="flex gap-3 px-2">
            <div className="w-9 h-9 bg-[#272727] rounded-full flex-shrink-0 animate-pulse"></div>
            
            <div className="flex flex-col gap-2 w-full pt-1">
              <div className="w-[90%] h-4 bg-[#272727] rounded animate-pulse"></div>
              <div className="w-[60%] h-4 bg-[#272727] rounded animate-pulse"></div>
              <div className="w-[40%] h-3 bg-[#272727] rounded mt-1 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGridSkeleton;
