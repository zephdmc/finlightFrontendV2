import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Account Deletion Policy
                </h1>

                <p className="text-gray-600 mb-6">
                    This page explains how to request the deletion of your account and data
                    for the <strong>Finlight</strong> mobile application.
                </p>

                <div className="space-y-8">
                    {/* Section 1: For Members */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            For Members (Organization Staff)
                        </h2>
                        <p className="text-gray-600 mb-3">
                            Member accounts are created and managed by the organization's
                            administrator. As a member, you cannot delete your own account.
                        </p>
                        <p className="text-gray-600 mb-3">
                            To delete your member account and profile data, you must contact
                            your organization's administrator. The admin can delete your account
                            by following these steps in the app:
                        </p>
                        <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
                            <li>Log in as the organization administrator.</li>
                            <li>Go to the <strong>Members</strong> page from the home screen.</li>
                            <li>Locate the member's name in the list.</li>
                            <li>Click the <strong>Delete</strong> (trash bin) icon in the member's row.</li>
                            <li>Confirm the deletion.</li>
                        </ol>
                        <p className="text-gray-600 mt-3">
                            <strong>What is deleted:</strong> Your name, email address, user ID,
                            and phone number.
                        </p>
                        <p className="text-gray-600 mt-2">
                            <strong>What is kept:</strong> Your transaction history will be
                            retained for legal and compliance purposes as required by financial
                            regulations.
                        </p>
                    </section>

                    {/* Section 2: For Admins */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            For Organization Administrators
                        </h2>
                        <p className="text-gray-600 mb-3">
                            An administrator can delete the entire organization account directly
                            from the app. To do so:
                        </p>
                        <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
                            <li>Log in as the organization administrator.</li>
                            <li>Click on the <strong>Profile</strong> icon in the navigation bar.</li>
                            <li>Click on <strong>Delete Organization</strong>.</li>
                            <li>
                                A confirmation pop-up will appear. Enter your <strong>Admin PIN</strong> to
                                proceed.
                            </li>
                            <li>
                                A verification code will be sent to the administrator's email
                                address. Enter the code to confirm deletion.
                            </li>
                            <li>Once confirmed, the organization account will be deleted.</li>
                        </ol>
                        <p className="text-gray-600 mt-3">
                            <strong>What is deleted:</strong> The organization profile, all member
                            profiles (names, emails, IDs, phone numbers), and login credentials.
                        </p>
                        <p className="text-gray-600 mt-2">
                            <strong>What is kept:</strong> All transaction history and financial
                            records will be retained for legal and compliance purposes.
                        </p>
                    </section>

                    {/* Section 3: Contact & Timeframe */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">
                            Processing Time & Contact
                        </h2>
                        <p className="text-gray-600 mb-2">
                            Once a deletion request is confirmed, the applicable data will be
                            removed from our active systems within <strong>30 days</strong>.
                        </p>
                        <p className="text-gray-600">
                            If you have any questions or need assistance, please contact us at:{' '}
                            <a
                                href="mailto:Zephcoredigital@Zephcoredigital.ng"
                                className="text-blue-600 hover:underline"
                            >
                                Zephcoredigital@Zephcoredigital.ng
                            </a>
                        </p>
                    </section>
                </div>

                <div className="mt-10 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;