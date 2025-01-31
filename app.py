from flask import Flask, render_template, request, redirect, session, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = "your_secret_key"

# Configure SQL Alchemy
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Database Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    mobile = db.Column(db.String(15), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Route to display the login page
@app.route("/")
def login():
    if "username" in session:
        return redirect(url_for('home'))
    return render_template("login.html")

# Route to handle login submission
@app.route("/login", methods=["POST"])
def login_post():
    username = request.form['username']
    password = request.form['password']
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        session['username'] = username
        return redirect(url_for('home'))
    else:
        flash("Invalid login credentials.")
        return redirect(url_for('login'))

# Route for registration
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form['name']
        age = request.form['age']
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        email = request.form['email']
        mobile = request.form['mobile']
        
        if password != confirm_password:
            flash("Passwords do not match!")
            return redirect(url_for('register'))

        user = User.query.filter_by(username=username).first()
        if user:
            flash("User already exists!")
            return redirect(url_for('register'))
        
        new_user = User(name=name, age=age, username=username, email=email, mobile=mobile)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        session['username'] = username
        return redirect(url_for('home'))
    
    return render_template("register.html")

# Route for the homepage after login
@app.route("/home")
def home():
    if "username" in session:
        user = User.query.filter_by(username=session['username']).first()
        if user is None:
            session.pop("username", None)  # Clear the session if user doesn't exist
            flash("User not found. Please log in again.")
            return redirect(url_for('login'))
        return render_template("home.html", username=user.name)
    return redirect(url_for('login'))


# Route for updating profile
@app.route("/profile", methods=["GET", "POST"])
def profile():
    if "username" in session:
        user = User.query.filter_by(username=session['username']).first()
        if request.method == "POST":
            user.name = request.form['name']
            user.age = request.form['age']
            user.email = request.form['email']
            user.mobile = request.form['mobile']
            db.session.commit()
            flash("Profile updated successfully!")
            return redirect(url_for('profile'))
        
        return render_template("profile.html", user=user)
    return redirect(url_for('login'))

# Route for changing password
@app.route("/change_password", methods=["POST"])
def change_password():
    if "username" in session:
        user = User.query.filter_by(username=session['username']).first()
        old_password = request.form['old_password']
        new_password = request.form['new_password']
        confirm_new_password = request.form['confirm_new_password']

        if not user.check_password(old_password):
            flash("Old password is incorrect!")
        elif new_password != confirm_new_password:
            flash("New passwords do not match!")
        else:
            user.set_password(new_password)
            db.session.commit()
            flash("Password updated successfully!")
        return redirect(url_for('profile'))
    return redirect(url_for('login'))

# Route for logging out
@app.route("/logout")
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/upload')
def upload():
    if "username" in session:
        user = User.query.filter_by(username=session['username']).first()
        return render_template('upload.html', username=user.name)

@app.route('/chatbot')
def chatbot():
    if "username" in session:
        user = User.query.filter_by(username=session['username']).first()
        return render_template('chatbot.html', username=user.name)

@app.route('/about')
def about():
    if "username" in session:
        user = User.query.filter_by(username=session['username']).first()
        return render_template('about.html', username=user.name)

@app.route('/contact')
def contact():
    if "username" in session:
        user = User.query.filter_by(username=session['username']).first()
        return render_template('contact.html', username=user.name)

# Initialize the database and run the app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
