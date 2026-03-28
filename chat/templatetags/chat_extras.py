from django import template

register = template.Library()


# Django nie posiada wbudowanego filtra split, więc definiujemy własny
@register.filter(name="split")
def split(value, arg):
    return value.split(arg)
