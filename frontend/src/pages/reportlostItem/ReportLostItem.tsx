import { useForm } from "react-hook-form";
import { Spinner } from "flowbite-react";
import toastNotify from "../../components/modal/toastNotify";
import { useState } from "react";
import {
  useCategoryQuery,
  useCreateLostItemMutation,
} from "../../redux/api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoIosArrowDown } from "react-icons/io";
import type { ItemCategory } from "../../types/types";

// Custom styles for DatePicker to match form styling
const datePickerStyles = `
  .react-datepicker__input-container input {
    background-color: rgb(55 65 81 / 0.7) !important;
    border: 1px solid rgb(75 85 99) !important;
    color: white !important;
    border-radius: 0.75rem !important;
    padding: 0.75rem 1rem !important;
    font-size: 0.875rem !important;
    width: 100% !important;
    outline: none !important;
  }
  .react-datepicker__input-container input:focus {
    border-color: rgb(6 182 212) !important;
    box-shadow: 0 0 0 1px rgb(6 182 212) !important;
  }
  .react-datepicker__input-container input::placeholder {
    color: rgb(156 163 175) !important;
  }
`;

const inputClass =
  "w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm";

type ReportLostForm = {
  lostItemName: string;
  description: string;
  imgUrl: string;
  location: string;
};

const ReportLostItem = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<ReportLostForm>();

  const [categoryId, setCategoryId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [createLostItem, { isLoading }] = useCreateLostItemMutation();
  const { data: Category } = useCategoryQuery("");
  const [startDate, setStartDate] = useState(new Date());

  const onSubmit = async (data: ReportLostForm) => {
    setSubmitted(true);
    if (!categoryId) return;

    try {
      const lostData = {
        lostItemName: data.lostItemName,
        description: data.description,
        categoryId,
        img: data.imgUrl,
        location: data.location,
        date: startDate,
      };
      const res = await createLostItem(lostData);
      if (res?.data?.success == false) {
        toastNotify({ message: "Failed to create Lost item", status: false });
      } else {
        toastNotify({ message: "Lost item reported successfully", status: true });
        reset();
        setCategoryId("");
        setSubmitted(false);
      }
    } catch {
      toastNotify({ message: "Failed to create Lost item", status: false });
    }
  };

  return (
    <>
      <style>{datePickerStyles}</style>
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-8">
            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Report Lost Item
            </h1>
            <p className="text-center text-gray-400 mb-8">
              Tell the community what you've lost so someone can help you find
              it.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="lostItemName"
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    Lost item name
                  </label>
                  <input
                    id="lostItemName"
                    {...register("lostItemName", {
                      required: "Lost item name is required",
                    })}
                    type="text"
                    className={inputClass}
                    placeholder="Laptop/Phone"
                  />
                  {errors.lostItemName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.lostItemName?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    Description
                  </label>
                  <input
                    id="description"
                    type="text"
                    className={inputClass}
                    placeholder="What does it look like, color, brand"
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.description?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="imgUrl"
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    Image url
                  </label>
                  <input
                    id="imgUrl"
                    type="text"
                    className={inputClass}
                    placeholder="http://lost-image.com"
                    {...register("imgUrl", {
                      required: "Image url is required",
                    })}
                  />
                  {errors.imgUrl && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.imgUrl?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="location"
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    className={inputClass}
                    placeholder="City, Country"
                    {...register("location", {
                      required: "Location is required",
                    })}
                  />
                  {errors.location && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.location?.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lostDate"
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    Date
                  </label>
                  <DatePicker
                    wrapperClassName="w-full"
                    className={inputClass}
                    selected={startDate}
                    onChange={(date) => {
                      if (date) setStartDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select date"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                  />
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      className={`${inputClass} appearance-none cursor-pointer`}
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                        if (submitted)
                          setSubmitted(
                            !Category?.data?.find(
                              (cat: ItemCategory) => cat.id === e.target.value
                            )
                          );
                      }}
                    >
                      <option value="" disabled className="text-gray-400">
                        Select a category
                      </option>
                      {Category?.data?.map((category: ItemCategory) => (
                        <option
                          key={category?.id}
                          value={category?.id}
                          className="text-white bg-gray-700"
                        >
                          {category?.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <IoIosArrowDown className="h-4 w-4" />
                    </div>
                  </div>
                  {submitted && !categoryId && (
                    <p className="text-red-400 text-sm mt-1">
                      Category is required
                    </p>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
                >
                  Submit Lost Item
                </button>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
export default ReportLostItem;