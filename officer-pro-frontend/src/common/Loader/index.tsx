import 'ldrs/dotStream';

const Loader = ({ fullScreen = true }) => {
  return (
    // <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
    //   <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    // </div>
    // <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
    //   <l-dot-stream size="200" speed="2.5" color="black"></l-dot-stream>
    // </div>
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'h-full'} bg-white dark:bg-black`}>
      <l-dot-stream
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40"
        // size="200"
        speed="2.5"
        color="black"
      ></l-dot-stream>
    </div>
  );
};

export default Loader;

