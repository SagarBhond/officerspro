import Complainee from './Complainee';

const Complaineepage = ({
  complaineeList,
  handleAddComplainee,
  handleComplaineeChange,
}) => {
  return (
    <div>
      {complaineeList.map((complainee, index) => (
        <Complainee
          key={index}
          index={index}
          complainee={complainee}
          handleComplaineeChange={(updatedComplainee) =>
            handleComplaineeChange(index, updatedComplainee)
          }
        />
      ))}
      <div className="flex justify-end">
        <button
          onClick={handleAddComplainee}
          className="relative px-5 py-2.5 mb-2 me-2 text-black backdrop-blur-sm border border-black rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200 dark:text-white"
        >
          Add Complainee
        </button>
      </div>
    </div>
  );
};

export default Complaineepage;
