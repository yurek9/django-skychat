from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm
User = get_user_model()


class SignupForm(UserCreationForm):
    # Dodajemy własne pola lub nadpisujemy istniejące, by dodać klasy CSS
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(
            attrs={
                "class": "w-full px-4 py-2 rounded-lg border border-gray-300 "
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                "outline-none transition-all",
                "placeholder": "Twój adres email",
            }
        ),
    )

    class Meta:
        model = User
        fields = ("username", "email")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Automatyczne dodanie klas Tailwind do wszystkich pól (username, password1, password2)
        common_classes = "w-full px-4 py-2 rounded-lg border border-gray-300 " \
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"

        for field_name in self.fields:
            self.fields[field_name].widget.attrs.update({"class": common_classes})
            # Dodanie placeholderów na podstawie nazwy pola
            self.fields[field_name].widget.attrs.update(
                {"placeholder": field_name.replace("_", " ").capitalize()}
            )
