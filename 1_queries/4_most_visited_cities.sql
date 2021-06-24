select properties.city, count(*) as total_reservations 
from reservations
join properties
on properties.id = property_id
group by properties.city
order by total_reservations desc;
