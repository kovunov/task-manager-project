const Spinner = () => (
  <div>
    <div className="mb-4 border-b border-gray-200">
      <nav className="-mb-px flex">
        <div className="mr-8 py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500">
          Loading...
        </div>
      </nav>
    </div>
    <div className="text-center p-4">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-indigo-500 border-r-transparent"></div>
    </div>
  </div>
);

export default Spinner;
