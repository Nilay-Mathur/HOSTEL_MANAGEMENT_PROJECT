DELIMITER //

-- Prevent overbooking
CREATE TRIGGER before_allocation_insert
BEFORE INSERT ON Allocation
FOR EACH ROW
BEGIN
    DECLARE cap INT;
    DECLARE occ INT;

    SELECT capacity, occupied_count INTO cap, occ
    FROM Room WHERE room_id = NEW.room_id;

    IF occ >= cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room is full';
    END IF;
END //

-- Update count after allocation
CREATE TRIGGER after_allocation_insert
AFTER INSERT ON Allocation
FOR EACH ROW
BEGIN
    UPDATE Room
    SET occupied_count = occupied_count + 1
    WHERE room_id = NEW.room_id;
END //

-- Update count after deallocation
CREATE TRIGGER after_allocation_delete
AFTER DELETE ON Allocation
FOR EACH ROW
BEGIN
    UPDATE Room
    SET occupied_count = occupied_count - 1
    WHERE room_id = OLD.room_id;
END //

DELIMITER ;