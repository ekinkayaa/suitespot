import React, { useState, useEffect, useRef } from "react";
import { Star, ChevronDown, Camera, X } from "lucide-react";
import "./WriteReview.css";
import { dorms } from "./dorms";

export default function WriteReview() {
  const [formData, setFormData] = useState({
    dormName: "",
    roomType: "",
    yearStayed: "",
    roomNumber: "",
    experience: "",
    photos: [],
    ratings: {
      cleanliness: 0,
      noiseLevel: 0,
      socialLife: 0,
      facilities: 0,
      location: 0,
      naturalLight: 0,
      overall: 0,
    },
  });

  const [dropdowns, setDropdowns] = useState({
    dormName: false,
    roomType: false,
    yearStayed: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const dropdownRefs = {
    dormName: useRef({ button: null, dropdown: null }),
    roomType: useRef({ button: null, dropdown: null }),
    yearStayed: useRef({ button: null, dropdown: null }),
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs).forEach((key) => {
        const ref = dropdownRefs[key].current;
        if (ref && ref.button && ref.dropdown) {
          if (!ref.button.contains(event.target) && !ref.dropdown.contains(event.target)) {
            setDropdowns((prev) => ({
              ...prev,
              [key]: false,
            }));
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update dropdown positions when they open
  useEffect(() => {
    if (!Object.values(dropdowns).some(Boolean)) return;

    const updatePositions = () => {
      Object.keys(dropdownRefs).forEach((key) => {
        if (dropdowns[key]) {
          const ref = dropdownRefs[key].current;
          if (ref && ref.button && ref.dropdown) {
            const rect = ref.button.getBoundingClientRect();
            // For position: fixed, use viewport coordinates directly (no scroll offsets needed)
            ref.dropdown.style.top = `${rect.bottom + 4}px`;
            ref.dropdown.style.left = `${rect.left}px`;
            ref.dropdown.style.width = `${rect.width}px`;
          }
        }
      });
    };

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      updatePositions();
    });

    // Also use a small timeout as backup
    const timeoutId = setTimeout(() => {
      updatePositions();
    }, 10);

    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [dropdowns]);

  const roomTypes = [
    "Single",
    "Double",
    "Triple",
    "Quad",
  ];

  const yearOptions = [
    "2024-2025",
    "2023-2024",
    "2022-2023",
    "2021-2022",
    "2020-2021",
    "Before 2020",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing/selecting
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRatingChange = (category, rating) => {
    setFormData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating,
      },
    }));
    // Clear error for this rating when user selects a rating
    if (errors[`ratings.${category}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`ratings.${category}`];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 5),
    }));
  };

  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).slice(0, 5);
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 5),
    }));
  };

  const toggleDropdown = (dropdown) => {
    setDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
      ...Object.keys(prev).reduce((acc, key) => {
        if (key !== dropdown) acc[key] = false;
        return acc;
      }, {}),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate dorm name
    if (!formData.dormName || formData.dormName.trim() === "") {
      newErrors.dormName = "Please select a dorm name";
    }

    // Validate room type
    if (!formData.roomType || formData.roomType.trim() === "") {
      newErrors.roomType = "Please select a room type";
    }

    // Validate year stayed
    if (!formData.yearStayed || formData.yearStayed.trim() === "") {
      newErrors.yearStayed = "Please select a year stayed";
    }

    // Validate room number
    if (!formData.roomNumber || formData.roomNumber.trim() === "") {
      newErrors.roomNumber = "Please enter your room number or floor";
    }

    // Validate experience
    if (!formData.experience || formData.experience.trim() === "") {
      newErrors.experience = "Please share your experience";
    }

    // Validate all ratings
    const ratingCategories = [
      "cleanliness",
      "noiseLevel",
      "socialLife",
      "facilities",
      "location",
      "naturalLight",
      "overall",
    ];

    ratingCategories.forEach((category) => {
      if (!formData.ratings[category] || formData.ratings[category] === 0) {
        newErrors[`ratings.${category}`] = `Please rate ${category === "noiseLevel" ? "noise level" : category === "socialLife" ? "social life" : category === "naturalLight" ? "natural light" : category}`;
      }
    });

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, firstErrorKey: Object.keys(newErrors)[0] };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const validation = validateForm();
    if (!validation.isValid) {
      // Scroll to first error after a short delay to ensure errors are rendered
      setTimeout(() => {
        if (validation.firstErrorKey) {
          const element = document.querySelector(`[data-field="${validation.firstErrorKey}"]`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
      return;
    }

    // Handle form submission here
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
  };

  const renderStars = (category, currentRating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="star-button"
            onClick={() => handleRatingChange(category, star)}
            onMouseEnter={(e) => {
              // Optional: add hover effect
            }}
          >
            <Star
              size={20}
              fill={star <= currentRating ? "#facc15" : "none"}
              stroke={star <= currentRating ? "#facc15" : "#cbd5e1"}
              className="star-icon"
            />
          </button>
        ))}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="write-review-wrapper">
        <div className="thank-you-container">
          <div className="thank-you-icon">✨</div>
          <div>
            <h1 className="thank-you-title">Thanks for Submitting Your Review!</h1>
            <p className="thank-you-message">
              You're making the process easier for everyone. Your insights help future students find their perfect home away from home.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="write-review-wrapper">
      <h1 className="review-title">Review Your Dorm</h1>
      <p className="review-subtitle">
        Share your experience to help future students choose the right dorm!
        Please be honest and constructive.
      </p>

      <form onSubmit={handleSubmit} className="review-form">
        {/* Dorm Information Section */}
        <div className="form-section">
          <h2 className="section-title">Dorm Information</h2>

          <div className="form-group" data-field="dormName">
            <label className="form-label">
              Dorm Name <span className="required">*</span>
            </label>
            <div className={`dropdown-wrapper ${dropdowns.dormName ? "open" : ""}`}>
              <button
                ref={(el) => {
                  if (!dropdownRefs.dormName.current) dropdownRefs.dormName.current = {};
                  dropdownRefs.dormName.current.button = el;
                }}
                type="button"
                className={`dropdown-button ${formData.dormName ? "has-value" : ""} ${errors.dormName ? "error" : ""}`}
                onClick={() => toggleDropdown("dormName")}
              >
                <span>
                  {formData.dormName || "Select Dorm Name"}
                </span>
                <ChevronDown
                  size={20}
                  className={`dropdown-icon ${dropdowns.dormName ? "open" : ""}`}
                />
              </button>
              {dropdowns.dormName && (
                <div 
                  className="dropdown-menu"
                  ref={(el) => {
                    if (!dropdownRefs.dormName.current) dropdownRefs.dormName.current = {};
                    dropdownRefs.dormName.current.dropdown = el;
                  }}
                >
                  {dorms.map((dorm) => (
                    <button
                      key={dorm.id}
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        handleInputChange("dormName", dorm.name);
                        toggleDropdown("dormName");
                      }}
                    >
                      {dorm.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.dormName && <span className="error-message">{errors.dormName}</span>}
          </div>

          <div className="form-group" data-field="roomType">
            <label className="form-label">
              Room Type <span className="required">*</span>
            </label>
            <div className={`dropdown-wrapper ${dropdowns.roomType ? "open" : ""}`}>
              <button
                ref={(el) => {
                  if (!dropdownRefs.roomType.current) dropdownRefs.roomType.current = {};
                  dropdownRefs.roomType.current.button = el;
                }}
                type="button"
                className={`dropdown-button ${formData.roomType ? "has-value" : ""} ${errors.roomType ? "error" : ""}`}
                onClick={() => toggleDropdown("roomType")}
              >
                <span>
                  {formData.roomType || "Select Room Type"}
                </span>
                <ChevronDown
                  size={20}
                  className={`dropdown-icon ${dropdowns.roomType ? "open" : ""}`}
                />
              </button>
              {dropdowns.roomType && (
                <div 
                  className="dropdown-menu"
                  ref={(el) => {
                    if (!dropdownRefs.roomType.current) dropdownRefs.roomType.current = {};
                    dropdownRefs.roomType.current.dropdown = el;
                  }}
                >
                  {roomTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        handleInputChange("roomType", type);
                        toggleDropdown("roomType");
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.roomType && <span className="error-message">{errors.roomType}</span>}
          </div>

          <div className="form-group" data-field="yearStayed">
            <label className="form-label">
              Year Stayed <span className="required">*</span>
            </label>
            <div className={`dropdown-wrapper ${dropdowns.yearStayed ? "open" : ""}`}>
              <button
                ref={(el) => {
                  if (!dropdownRefs.yearStayed.current) dropdownRefs.yearStayed.current = {};
                  dropdownRefs.yearStayed.current.button = el;
                }}
                type="button"
                className={`dropdown-button ${formData.yearStayed ? "has-value" : ""} ${errors.yearStayed ? "error" : ""}`}
                onClick={() => toggleDropdown("yearStayed")}
              >
                <span>
                  {formData.yearStayed || "Select Year Stayed"}
                </span>
                <ChevronDown
                  size={20}
                  className={`dropdown-icon ${dropdowns.yearStayed ? "open" : ""}`}
                />
              </button>
              {dropdowns.yearStayed && (
                <div 
                  className="dropdown-menu"
                  ref={(el) => {
                    if (!dropdownRefs.yearStayed.current) dropdownRefs.yearStayed.current = {};
                    dropdownRefs.yearStayed.current.dropdown = el;
                  }}
                >
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        handleInputChange("yearStayed", year);
                        toggleDropdown("yearStayed");
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.yearStayed && <span className="error-message">{errors.yearStayed}</span>}
          </div>

          <div className="form-group" data-field="roomNumber">
            <label className="form-label">
              Room Number / Floor <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.roomNumber ? "error" : ""}`}
              placeholder="Add your room or floor (e.g. 8th floor, Suite A, Room 8A10)"
              value={formData.roomNumber}
              onChange={(e) => handleInputChange("roomNumber", e.target.value)}
            />
            {errors.roomNumber && <span className="error-message">{errors.roomNumber}</span>}
          </div>
        </div>

        {/* Your Experience Section */}
        <div className="form-section" data-field="experience">
          <h2 className="section-title">Your Experience</h2>
          <label className="experience-label">
            Tell us what it was like living in this dorm — the good, the bad, and everything in between. <span className="required">*</span>
          </label>
          <textarea
            className={`experience-textarea ${errors.experience ? "error" : ""}`}
            placeholder={`What were your expectations before moving in?\nHow were the facilities (bathroom, kitchen, laundry)?\nWas it clean, quiet, or social?\nHow was the location (proximity to campus, dining, or subway)?\nHow was your floor culture or community atmosphere?\nWas it easy to study, sleep, or hang out?`}
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            rows={12}
          />
          {errors.experience && <span className="error-message">{errors.experience}</span>}
        </div>

        {/* Upload Photos Section */}
        <div className="form-section">
          <h2 className="section-title">Upload Photos</h2>
          <p className="section-description">
            Add up to 5 photos of your room, common areas, or dorm views.
          </p>
          <div
            className="upload-area"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              <Camera size={32} className="upload-icon" />
              <div className="upload-text">
                <button
                  type="button"
                  className="upload-link"
                  onClick={() => document.getElementById("file-input").click()}
                >
                  + Add Photos
                </button>
                <span className="upload-hint">
                  Drag and drop or click to upload
                </span>
              </div>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
          {formData.photos.length > 0 && (
            <div className="photos-preview">
              {formData.photos.map((photo, index) => (
                <div key={index} className="photo-preview-item">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="photo-preview-img"
                  />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ratings Section */}
        <div className="form-section">
          <h2 className="section-title">Ratings</h2>
          <p className="section-description">
            Rate your dorm experience in a few categories.{" "}
            <span className="required">*</span>
          </p>
          <div className="ratings-list">
            {[
              { key: "cleanliness", label: "Cleanliness" },
              { key: "noiseLevel", label: "Noise Level" },
              { key: "socialLife", label: "Social Life" },
              { key: "facilities", label: "Facilities" },
              { key: "location", label: "Location" },
              { key: "naturalLight", label: "Natural Light" },
              { key: "overall", label: "Overall" },
            ].map(({ key, label }) => (
              <div key={key} className={`rating-item ${errors[`ratings.${key}`] ? "rating-item-error" : ""}`} data-field={`ratings.${key}`}>
                <span className="rating-label">{label}</span>
                <div className="rating-input-wrapper">
                  {renderStars(key, formData.ratings[key])}
                  {errors[`ratings.${key}`] && <span className="error-message rating-error">{errors[`ratings.${key}`]}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-button">
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}
