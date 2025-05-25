import { useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, FunnelIcon, PlusIcon, Squares2X2Icon } from '@heroicons/react/20/solid'

const sortOptions = [
  { name: 'דירוג הכי גבוה', value: 'rating', current: false },
  { name: 'מחיר: נמוך לגבוה', value: 'price-low', current: false },
  { name: 'מחיר: גבוה לנמוך', value: 'price-high', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const CourseFilters = ({ 
  courses, 
  onFilterChange, 
  onSortChange, 
  activeFilters = {},
  activeSort = 'popular',
  children
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Extract unique values from courses for filter options
  const uniqueCourseNames = [...new Set(courses.map(course => course.course_name).filter(Boolean))]
  const uniqueTutors = [...new Set(courses.map(course => course.tutor_name).filter(Boolean))]
  const uniqueDegrees = [...new Set(courses.map(course => course.degree_name).filter(Boolean))]
  const uniqueYears = [...new Set(courses.map(course => course.course_year).filter(year => year != null))].sort()

  const subCategories = uniqueCourseNames.map(name => ({ name, href: '#' }))

  const filters = [
    {
      id: 'course_year',
      name: 'שנה',
      options: uniqueYears.map(year => ({
        value: year.toString(),
        label: `שנה ${year}`,
        checked: activeFilters.course_year?.includes(year.toString()) || false
      }))
    },
    {
      id: 'tutor_name',
      name: 'מרצה',
      options: uniqueTutors.map(tutor => ({
        value: tutor,
        label: tutor,
        checked: activeFilters.tutor_name?.includes(tutor) || false
      }))
    },
    {
      id: 'price_range',
      name: 'טווח מחירים',
      options: [
        { value: 'free', label: 'חינם', checked: activeFilters.price_range?.includes('free') || false },
        { value: 'low', label: '₪1-100', checked: activeFilters.price_range?.includes('low') || false },
        { value: 'medium', label: '₪101-500', checked: activeFilters.price_range?.includes('medium') || false },
        { value: 'high', label: '₪500+', checked: activeFilters.price_range?.includes('high') || false },
      ]
    },
    {
      id: 'rating',
      name: 'דירוג',
      options: [
        { value: '5', label: '5 כוכבים', checked: activeFilters.rating?.includes('5') || false },
        { value: '4', label: '4+ כוכבים', checked: activeFilters.rating?.includes('4') || false },
        { value: '3', label: '3+ כוכבים', checked: activeFilters.rating?.includes('3') || false },
      ]
    },
    {
      id: 'access',
      name: 'סטטוס גישה',
      options: [
        { value: 'owned', label: 'קורסים שרכשתי', checked: activeFilters.access?.includes('owned') || false },
        { value: 'available', label: 'זמין לרכישה', checked: activeFilters.access?.includes('available') || false },
      ]
    }
  ]

  const handleFilterChange = (filterId, value, checked) => {
    const currentFilters = { ...activeFilters }
    
    if (!currentFilters[filterId]) {
      currentFilters[filterId] = []
    }
    
    if (checked) {
      currentFilters[filterId] = [...currentFilters[filterId], value]
    } else {
      currentFilters[filterId] = currentFilters[filterId].filter(item => item !== value)
    }
    
    // Remove empty filter arrays
    if (currentFilters[filterId].length === 0) {
      delete currentFilters[filterId]
    }
    
    onFilterChange(currentFilters)
  }

  const handleSubCategoryFilter = (courseName) => {
    const currentFilters = { ...activeFilters }
    
    if (!currentFilters.course_name) {
      currentFilters.course_name = []
    }
    
    if (currentFilters.course_name.includes(courseName)) {
      currentFilters.course_name = currentFilters.course_name.filter(item => item !== courseName)
    } else {
      currentFilters.course_name = [...currentFilters.course_name, courseName]
    }
    
    if (currentFilters.course_name.length === 0) {
      delete currentFilters.course_name
    }
    
    onFilterChange(currentFilters)
  }

  const handleSortChange = (sortValue) => {
    onSortChange(sortValue)
  }

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative mr-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">מסננים</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="-ml-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                >
                  <span className="sr-only">סגור תפריט</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              {/* Mobile Filters */}
              <form className="mt-4 border-t border-gray-200">
                <h3 className="sr-only">קטגוריות</h3>
                <ul role="list" className="px-2 py-3 font-medium text-gray-900">
                  {subCategories.map((category) => (
                    <li key={category.name}>
                      <button
                        type="button"
                        onClick={() => handleSubCategoryFilter(category.name)}
                        className={`block px-2 py-3 w-full text-right ${
                          activeFilters.course_name?.includes(category.name) 
                            ? 'text-indigo-600 font-semibold' 
                            : 'text-gray-900'
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>

                {filters.map((section) => (
                  <Disclosure key={section.id} as="div" className="border-t border-gray-200 px-4 py-6">
                    <h3 className="-mx-2 -my-3 flow-root">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">{section.name}</span>
                        <span className="mr-6 flex items-center">
                          <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-6">
                      <div className="space-y-6">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex gap-3">
                            <div className="flex h-5 shrink-0 items-center">
                              <div className="group grid size-4 grid-cols-1">
                                <input
                                  defaultValue={option.value}
                                  id={`filter-mobile-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  type="checkbox"
                                  checked={option.checked}
                                  onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                />
                                <svg
                                  fill="none"
                                  viewBox="0 0 14 14"
                                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                >
                                  <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-checked:opacity-100"
                                  />
                                  <path
                                    d="M3 7H11"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-indeterminate:opacity-100"
                                  />
                                </svg>
                              </div>
                            </div>
                            <label
                              htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                              className="min-w-0 flex-1 text-gray-500"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pt-24 pb-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">קורסים</h1>

            <div className="flex items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    מיון
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-ml-1 mr-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                  </MenuButton>
                </div>

                <MenuItems
                  transition
                  className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value}>
                        <button
                          type="button"
                          onClick={() => handleSortChange(option.value)}
                          className={classNames(
                            activeSort === option.value ? 'font-medium text-gray-900' : 'text-gray-500',
                            'block w-full text-right px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden',
                          )}
                        >
                          {option.name}
                        </button>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>

              <button type="button" className="-m-2 mr-5 p-2 text-gray-400 hover:text-gray-500 sm:mr-7">
                <span className="sr-only">תצוגת רשת</span>
                <Squares2X2Icon aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="-m-2 mr-4 p-2 text-gray-400 hover:text-gray-500 sm:mr-6 lg:hidden"
              >
                <span className="sr-only">מסננים</span>
                <FunnelIcon aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>

          <section aria-labelledby="products-heading" className="pt-6 pb-24">
            <h2 id="products-heading" className="sr-only">
              קורסים
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
              {/* Desktop Filters */}
              <form className="hidden lg:block">
                <h3 className="sr-only">קטגוריות</h3>
                <ul role="list" className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
                  {subCategories.map((category) => (
                    <li key={category.name}>
                      <button
                        type="button"
                        onClick={() => handleSubCategoryFilter(category.name)}
                        className={`text-right w-full ${
                          activeFilters.course_name?.includes(category.name) 
                            ? 'text-indigo-600 font-semibold' 
                            : 'text-gray-900 hover:text-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>

                {filters.map((section) => (
                  <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-6">
                    <h3 className="-my-3 flow-root">
                      <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                        <span className="font-medium text-gray-900">{section.name}</span>
                        <span className="mr-6 flex items-center">
                          <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pt-6">
                      <div className="space-y-4">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex gap-3">
                            <div className="flex h-5 shrink-0 items-center">
                              <div className="group grid size-4 grid-cols-1">
                                <input
                                  defaultValue={option.value}
                                  defaultChecked={option.checked}
                                  id={`filter-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  type="checkbox"
                                  checked={option.checked}
                                  onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                />
                                <svg
                                  fill="none"
                                  viewBox="0 0 14 14"
                                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                                >
                                  <path
                                    d="M3 8L6 11L11 3.5"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-checked:opacity-100"
                                  />
                                  <path
                                    d="M3 7H11"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="opacity-0 group-has-indeterminate:opacity-100"
                                  />
                                </svg>
                              </div>
                            </div>
                            <label htmlFor={`filter-${section.id}-${optionIdx}`} className="text-sm text-gray-600">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </form>

              {/* Course grid */}
              <div className="lg:col-span-4">
                {children}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default CourseFilters 