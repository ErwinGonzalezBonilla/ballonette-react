import { useState } from "react";

const QuoteForm = () => {

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        event_type: "",
        service_type: "",
        event_date: "",
        guest_count: "",
        budget: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/quote-requests",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                setSuccess(true);

                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    event_type: "",
                    service_type: "",
                    event_date: "",
                    guest_count: "",
                    budget: "",
                    message: ""
                });
            }

        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

return (
    <section className="quote-section">

        <div className="quote-overlay">

            <div className="quote-header">
                <h2>Request a Quote</h2>

                <p>
                    Tell us about your event and we will create
                    a personalized experience for you.
                </p>
            </div>

            {success && (
                <div className="success-message">
                    Quote request sent successfully!
                </div>
            )}

            <form
                className="quote-form"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="event_type"
                    placeholder="Event Type"
                    value={formData.event_type}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="service_type"
                    placeholder="Service Type"
                    value={formData.service_type}
                    onChange={handleChange}
                    required
                />

                <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="guest_count"
                    placeholder="Guest Count"
                    value={formData.guest_count}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="budget"
                    placeholder="Estimated Budget"
                    value={formData.budget}
                    onChange={handleChange}
                />

                <textarea
                    name="message"
                    placeholder="Tell us more about your event..."
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                />

                <button type="submit">
                    {loading
                        ? "Sending..."
                        : "Send Quote Request"}
                </button>

            </form>

        </div>

    </section>
);
};

export default QuoteForm;